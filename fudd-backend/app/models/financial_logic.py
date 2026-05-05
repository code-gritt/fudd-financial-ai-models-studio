from math import pow
from typing import List, Tuple, Dict
from app.core.schemas import (
    LBOInput, LBOOutput, DebtSchedule,
    CompsInput, CompsOutput,
    ReverseDCFInput, ReverseDCFOutput,
    MAndAInput, MAndAOutput,
    BusinessAssumptions, ModelGeneratorOutput, FinancialStatement
)

def run_lbo_model(input_data: LBOInput) -> LBOOutput:
    purchase_price = input_data.ebitda * input_data.purchase_ebitda_multiple
    
    senior_debt = purchase_price * input_data.senior_debt_percent
    sub_debt = purchase_price * input_data.sub_debt_percent
    total_debt = senior_debt + sub_debt
    initial_equity = purchase_price * input_data.initial_equity_percent
    
    if abs((initial_equity + total_debt) - purchase_price) > 1:
        initial_equity = purchase_price - total_debt
    
    ebitda_schedule = []
    ebitda_current = input_data.ebitda
    for year in range(1, input_data.holding_period_years + 1):
        ebitda_current = ebitda_current * (1 + input_data.ebitda_growth_rate)
        ebitda_schedule.append(ebitda_current)
    
    debt_repayment_rate = 0.80
    senior_balance = senior_debt
    sub_balance = sub_debt
    debt_schedule = []
    
    for year in range(1, input_data.holding_period_years + 1):
        ebitda_year = ebitda_schedule[year - 1]
        senior_interest = senior_balance * input_data.senior_interest_rate
        sub_interest = sub_balance * input_data.sub_interest_rate
        total_interest = senior_interest + sub_interest
        cash_for_debt = ebitda_year * debt_repayment_rate
        principal_payment = max(0, cash_for_debt - total_interest)
        
        principal_to_senior = min(principal_payment, senior_balance)
        senior_balance -= principal_to_senior
        principal_to_sub = min(principal_payment - principal_to_senior, sub_balance)
        sub_balance -= principal_to_sub
        
        debt_schedule.append(DebtSchedule(
            year=year,
            beginning_balance=senior_balance + sub_balance,
            interest=round(total_interest, 0),
            principal_payment=round(principal_payment, 0),
            ending_balance=round(senior_balance + sub_balance, 0)
        ))
    
    exit_debt_balance = senior_balance + sub_balance
    exit_ebitda = ebitda_schedule[-1]
    exit_enterprise_value = exit_ebitda * input_data.exit_ebitda_multiple
    exit_equity_value = exit_enterprise_value - exit_debt_balance
    cash_on_cash_return = exit_equity_value / initial_equity
    
    if initial_equity > 0 and exit_equity_value > 0:
        irr = pow(exit_equity_value / initial_equity, 1 / input_data.holding_period_years) - 1
    else:
        irr = 0
    
    summary = f"Buy at {input_data.purchase_ebitda_multiple}x EBITDA (${purchase_price:,.0f}) with ${initial_equity:,.0f} equity. " \
              f"Sell after {input_data.holding_period_years} years at {input_data.exit_ebitda_multiple}x on ${exit_ebitda:,.0f} EBITDA = ${exit_enterprise_value:,.0f}. " \
              f"Exit equity = ${exit_equity_value:,.0f}. Return = {cash_on_cash_return:.1f}x money, IRR = {irr*100:.1f}%."
    
    return LBOOutput(
        purchase_price=round(purchase_price, 0),
        total_debt=round(total_debt, 0),
        initial_equity=round(initial_equity, 0),
        exit_ebitda=round(exit_ebitda, 0),
        exit_enterprise_value=round(exit_enterprise_value, 0),
        exit_debt_balance=round(exit_debt_balance, 0),
        exit_equity_value=round(exit_equity_value, 0),
        irr_percent=round(irr * 100, 1),
        cash_on_cash_return=round(cash_on_cash_return, 1),
        debt_schedule=debt_schedule,
        summary=summary
    )

def run_comps_analysis(input_data: CompsInput) -> CompsOutput:
    target = input_data.target_company
    comps = input_data.comparable_companies
    
    ev_revenue_multiples: List[float] = []
    pe_multiples: List[float] = []

    for comp in comps:
        if comp.revenue > 0:
            ev_revenue_multiples.append(1.0)
        if comp.net_income > 0:
            pe_multiples.append(comp.revenue / comp.net_income)

    avg_ev_rev = sum(ev_revenue_multiples) / len(ev_revenue_multiples) if ev_revenue_multiples else 1.0
    avg_pe = sum(pe_multiples) / len(pe_multiples) if pe_multiples else 10.0

    valuation_by_revenue = target.revenue * avg_ev_rev
    valuation_by_earnings = target.net_income * avg_pe

    low = min(valuation_by_revenue, valuation_by_earnings)
    high = max(valuation_by_revenue, valuation_by_earnings)

    return CompsOutput(
        implied_valuation_range={"low": low, "high": high},
        multiples_used={"ev_revenue": round(avg_ev_rev, 2), "pe_ratio": round(avg_pe, 2)},
        explanation=(
            f"Based on {len(comps)} comparable companies, your target is worth between "
            f"${low:,.0f} and ${high:,.0f}."
        ),
    )

def run_reverse_dcf(input_data: ReverseDCFInput) -> ReverseDCFOutput:
    price = input_data.current_stock_price
    fcf = input_data.free_cash_flow_per_share
    r = input_data.discount_rate
    n = input_data.years
    g_terminal = input_data.terminal_growth_estimate

    low_g, high_g = -0.20, 0.40
    iterations = 50

    for _ in range(iterations):
        mid_g = (low_g + high_g) / 2
        pv = 0.0
        for year in range(1, n + 1):
            fcf_year = fcf * pow(1 + mid_g, year)
            pv += fcf_year / pow(1 + r, year)

        terminal_fcf = fcf * pow(1 + mid_g, n + 1)
        terminal_value = terminal_fcf / (r - g_terminal)
        pv_terminal = terminal_value / pow(1 + r, n)
        total_value = pv + pv_terminal

        if total_value > price:
            high_g = mid_g
        else:
            low_g = mid_g

    implied_g = (low_g + high_g) / 2
    
    verdicts = [
        (0.02, "🔴 PESSIMISTIC – Market expects almost no growth"),
        (0.08, "🟡 MODERATE – Market expects steady but slow growth"),
        (0.15, "🟢 OPTIMISTIC – Market expects strong growth"),
        (99.0, "🚀 EUPHORIC – Market expects very high growth (be careful!)")
    ]
    verdict = next(v for threshold, v in verdicts if implied_g < threshold)

    justified_price = 0.0
    for year in range(1, n + 1):
        fcf_year = fcf * pow(1 + implied_g, year)
        justified_price += fcf_year / pow(1 + r, year)
    
    terminal_fcf = fcf * pow(1 + implied_g, n + 1)
    terminal_value = terminal_fcf / (r - g_terminal)
    justified_price += terminal_value / pow(1 + r, n)

    return ReverseDCFOutput(
        implied_growth_rate=round(implied_g * 100, 2),
        justified_stock_price=round(justified_price, 2),
        verdict=verdict,
        explanation=(
            f"With current price of ${price:,.2f}, the market expects {round(implied_g * 100, 2)}% "
            f"annual cash flow growth over {n} years."
        ),
    )

def run_m_and_a_model(input_data: MAndAInput) -> MAndAOutput:
    buyer_eps = input_data.buyer.eps if input_data.buyer.eps > 0 else input_data.buyer.net_income / input_data.buyer.shares_outstanding
    target_eps = input_data.target.eps if input_data.target.eps > 0 else input_data.target.net_income / input_data.target.shares_outstanding
    
    pro_forma_ni = input_data.buyer.net_income + input_data.target.net_income + input_data.synergies
    after_tax_transaction_costs = input_data.transaction_costs * (1 - input_data.tax_rate)
    pro_forma_ni -= after_tax_transaction_costs
    
    stock_consideration = input_data.purchase_price * input_data.stock_percent
    new_shares_issued = stock_consideration / input_data.buyer_stock_price
    pro_forma_shares = input_data.buyer.shares_outstanding + new_shares_issued
    
    pro_forma_eps = pro_forma_ni / pro_forma_shares if pro_forma_shares > 0 else 0
    eps_change = pro_forma_eps - buyer_eps
    accretion_dilution_percent = (eps_change / buyer_eps) * 100
    
    if accretion_dilution_percent > 0:
        verdict = f"🟢 ACCRETIVE (+{round(accretion_dilution_percent, 2)}%)"
    elif accretion_dilution_percent < 0:
        verdict = f"🔴 DILUTIVE ({round(accretion_dilution_percent, 2)}%)"
    else:
        verdict = "⚪ NEUTRAL (0%)"
    
    explanation = f"Buyer EPS: ${buyer_eps:.2f} → Pro-forma EPS: ${pro_forma_eps:.2f}."
    
    return MAndAOutput(
        buyer_standalone_eps=round(buyer_eps, 2),
        target_standalone_eps=round(target_eps, 2),
        pro_forma_net_income=round(pro_forma_ni, 0),
        pro_forma_shares=round(pro_forma_shares, 0),
        pro_forma_eps=round(pro_forma_eps, 2),
        accretion_dilution_percent=round(accretion_dilution_percent, 2),
        verdict=verdict,
        explanation=explanation
    )

def run_financial_model_gen(assumptions: BusinessAssumptions) -> ModelGeneratorOutput:
    projections: List[FinancialStatement] = []

    for year in range(1, assumptions.years_to_project + 1):
        revenue = assumptions.initial_revenue * pow(1 + assumptions.revenue_growth_rate, year - 1)
        cogs = revenue * assumptions.cogs_percentage
        gross_profit = revenue - cogs
        op_ex = revenue * assumptions.operating_expenses_percentage
        op_income = gross_profit - op_ex
        taxes = max(0.0, op_income * assumptions.tax_rate)
        net_income = op_income - taxes

        projections.append(
            FinancialStatement(
                year=year,
                revenue=round(revenue, 0),
                cogs=round(cogs, 0),
                gross_profit=round(gross_profit, 0),
                operating_expenses=round(op_ex, 0),
                operating_income=round(op_income, 0),
                taxes=round(taxes, 0),
                net_income=round(net_income, 0),
            )
        )

    final_year = projections[-1]
    total_growth = ((final_year.revenue / assumptions.initial_revenue) - 1) * 100
    summary = f"{assumptions.company_name} grows {total_growth:.0f}% over {assumptions.years_to_project} years."

    return ModelGeneratorOutput(company_name=assumptions.company_name, projections=projections, summary=summary)
