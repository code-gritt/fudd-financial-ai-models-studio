from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List
from math import pow
import random
import asyncio
from typing import List, Optional

app = FastAPI(title="FUDD Finance", description="Weird finance models that work")

@app.get("/health")
def health():
    return {"status": "ok"}


# ----- AUTH MODELS -----
class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    initials: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

@app.post("/api/v1/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """
    Mock login endpoint. Accepts any password for now.
    """
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    # Mock user data based on username
    name_parts = request.username.split(".")
    full_name = " ".join([p.capitalize() for p in name_parts]) if len(name_parts) > 1 else request.username.capitalize()
    initials = "".join([p[0].upper() for p in name_parts]) if len(name_parts) > 1 else request.username[:2].upper()
    
    return LoginResponse(
        access_token="fake-jwt-token-for-fudd",
        user=UserProfile(
            id="user-123",
            username=request.username,
            email=f"{request.username}@fudd.finance",
            full_name=full_name,
            initials=initials
        )
    )

# ----- LEVEL 5: LBO (LEVERAGED BUYOUT) MODEL -----
from typing import List, Tuple

class LBOInput(BaseModel):
    # Company financials
    ebitda: float = Field(..., gt=0, description="Current year EBITDA")
    ebitda_growth_rate: float = Field(0.05, ge=-0.20, le=0.30, description="Annual EBITDA growth %")
    
    # Deal terms
    purchase_ebitda_multiple: float = Field(8.0, ge=4.0, le=15.0, description="Purchase price = EBITDA × multiple")
    exit_ebitda_multiple: float = Field(8.0, ge=4.0, le=15.0, description="Exit at this multiple")
    
    # Debt financing
    senior_debt_percent: float = Field(0.50, ge=0.0, le=0.80, description="% of purchase price from senior debt")
    senior_interest_rate: float = Field(0.08, ge=0.04, le=0.15, description="Senior debt interest rate")
    sub_debt_percent: float = Field(0.25, ge=0.0, le=0.50, description="% of purchase price from subordinated debt")
    sub_interest_rate: float = Field(0.12, ge=0.06, le=0.20, description="Sub debt interest rate (higher risk)")
    
    # Exit and time
    holding_period_years: int = Field(5, ge=3, le=7, description="Years before selling")
    initial_equity_percent: float = Field(0.25, ge=0.10, le=0.40, description="% of purchase price from sponsor equity")

class DebtSchedule(BaseModel):
    year: int
    beginning_balance: float
    interest: float
    principal_payment: float
    ending_balance: float

class LBOOutput(BaseModel):
    purchase_price: float
    total_debt: float
    initial_equity: float
    exit_ebitda: float
    exit_enterprise_value: float
    exit_debt_balance: float
    exit_equity_value: float
    irr_percent: float
    cash_on_cash_return: float  # Multiple of money (MoM)
    debt_schedule: List[DebtSchedule]
    summary: str

@app.post("/api/v1/lbo", response_model=LBOOutput)
def lbo_model(input_data: LBOInput):
    """
    Leveraged Buyout Model: Buy a company with debt, sell after X years.
    Returns IRR and multiple of money (MoM).
    """
    # Step 1: Purchase price and financing
    purchase_price = input_data.ebitda * input_data.purchase_ebitda_multiple
    
    senior_debt = purchase_price * input_data.senior_debt_percent
    sub_debt = purchase_price * input_data.sub_debt_percent
    total_debt = senior_debt + sub_debt
    initial_equity = purchase_price * input_data.initial_equity_percent
    
    # Validate equity + debt = purchase price (should, but check)
    if abs((initial_equity + total_debt) - purchase_price) > 1:
        # Adjust equity to balance (simple fix)
        initial_equity = purchase_price - total_debt
    
    # Step 2: Project EBITDA over holding period
    ebitda_schedule = []
    ebitda_current = input_data.ebitda
    for year in range(1, input_data.holding_period_years + 1):
        ebitda_current = ebitda_current * (1 + input_data.ebitda_growth_rate)
        ebitda_schedule.append(ebitda_current)
    
    # Step 3: Debt schedule (pay down debt with cash flows)
    # Simplified: use 80% of EBITDA for debt repayment (rest for taxes, capex)
    debt_repayment_rate = 0.80  # 80% of EBITDA goes to debt paydown
    
    senior_balance = senior_debt
    sub_balance = sub_debt
    debt_schedule = []
    
    for year in range(1, input_data.holding_period_years + 1):
        ebitda_year = ebitda_schedule[year - 1]
        
        # Interest payments
        senior_interest = senior_balance * input_data.senior_interest_rate
        sub_interest = sub_balance * input_data.sub_interest_rate
        total_interest = senior_interest + sub_interest
        
        # Cash available for principal repayment
        cash_for_debt = ebitda_year * debt_repayment_rate
        principal_payment = max(0, cash_for_debt - total_interest)
        
        # Apply principal to senior debt first (senior gets paid first)
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
    
    # Step 4: Exit value
    exit_ebitda = ebitda_schedule[-1]
    exit_enterprise_value = exit_ebitda * input_data.exit_ebitda_multiple
    exit_equity_value = exit_enterprise_value - exit_debt_balance
    
    # Step 5: Returns calculations
    cash_on_cash_return = exit_equity_value / initial_equity
    
    # IRR calculation: initial equity (-) to exit equity (+)
    # Solving for r: exit_equity = initial_equity * (1 + r)^n
    # r = (exit_equity / initial_equity)^(1/n) - 1
    if initial_equity > 0 and exit_equity_value > 0:
        irr = pow(exit_equity_value / initial_equity, 1 / input_data.holding_period_years) - 1
    else:
        irr = 0
    
    # Step 6: Summary
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

# ----- PYDANTIC MODELS (your TypeScript interfaces) -----
class CompanyMetrics(BaseModel):
    revenue: float
    ebitda: float
    net_income: float


class CompsInput(BaseModel):
    target_company: CompanyMetrics
    comparable_companies: List[CompanyMetrics]


class CompsOutput(BaseModel):
    implied_valuation_range: Dict[str, float]
    multiples_used: Dict[str, float]
    explanation: str


# ----- LEVEL 1: FINANCIAL MODEL GENERATOR -----
class BusinessAssumptions(BaseModel):
    company_name: str = "My Company"
    initial_revenue: float = Field(..., gt=0)
    revenue_growth_rate: float = Field(0.10, ge=-0.5, le=2.0)  # -50% to +200%
    cogs_percentage: float = Field(0.40, ge=0.0, le=1.0)  # Cost of goods sold as % of revenue
    operating_expenses_percentage: float = Field(0.30, ge=0.0, le=1.0)
    tax_rate: float = Field(0.21, ge=0.0, le=0.40)
    years_to_project: int = Field(5, ge=1, le=10)


class FinancialStatement(BaseModel):
    year: int
    revenue: float
    cogs: float
    gross_profit: float
    operating_expenses: float
    operating_income: float
    taxes: float
    net_income: float


class ModelGeneratorOutput(BaseModel):
    company_name: str
    projections: List[FinancialStatement]
    summary: str

# ----- LEVEL 7: MONTE CARLO SIMULATION -----
class MonteCarloInput(BaseModel):
    base_revenue: float = Field(..., gt=0)
    revenue_growth_mean: float = Field(0.10, description="Average expected growth")
    revenue_growth_std: float = Field(0.05, description="Volatility (standard deviation)")
    years: int = Field(5, ge=1, le=10)
    simulations: int = Field(1000, ge=100, le=10000, description="Number of scenarios to run")
    cogs_percentage: float = Field(0.40, ge=0.0, le=1.0)
    op_ex_percentage: float = Field(0.30, ge=0.0, le=1.0)

class SimulationResult(BaseModel):
    final_net_income: float
    scenario_id: int

class MonteCarloOutput(BaseModel):
    total_simulations: int
    mean_net_income: float
    median_net_income: float
    p10_net_income: float  # 10th percentile (bad case)
    p90_net_income: float  # 90th percentile (good case)
    probability_positive: float  # % of scenarios with profit
    worst_case: float
    best_case: float
    all_outcomes: List[float] = Field(default=[], description="All simulation results for charting")

# ----- LEVEL 3: COMPARABLE COMPANY ANALYSIS -----
@app.post("/api/v1/comps", response_model=CompsOutput)
def comparable_company_analysis(input_data: CompsInput):
    """Calculates a simplified valuation range from comparable companies."""

    target = input_data.target_company
    comps = input_data.comparable_companies

    if not comps:
        raise HTTPException(status_code=400, detail="Need at least 1 comparable company")

    # NOTE: We don't have Enterprise Value in the input, so EV/Revenue is a placeholder.
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


# ----- HEALTH CHECK -----
@app.get("/")
def root():
    return {"message": "FUDD is alive. Finance models loading...", "status": "weird but working"}


# ----- LEVEL 2: REVERSE DCF (Implied Growth Calculator) -----
class ReverseDCFInput(BaseModel):
    current_stock_price: float = Field(..., gt=0, description="Current share price")
    free_cash_flow_per_share: float = Field(..., gt=0, description="Last 12 months FCF per share")
    discount_rate: float = Field(0.10, ge=0.05, le=0.20, description="Required return (usually 8-12%)")
    years: int = Field(5, ge=1, le=10, description="Forecast period in years")
    terminal_growth_estimate: float = Field(
        0.03, ge=0.0, le=0.05, description="Long-term growth after forecast (usually 2-4%)"
    )


class ReverseDCFOutput(BaseModel):
    implied_growth_rate: float
    justified_stock_price: float
    verdict: str
    explanation: str


@app.post("/api/v1/reverse-dcf", response_model=ReverseDCFOutput)
def reverse_dcf_calculator(input_data: ReverseDCFInput):
    """Given a stock price, solve for the implied growth rate via binary search."""

    price = input_data.current_stock_price
    fcf = input_data.free_cash_flow_per_share
    r = input_data.discount_rate
    n = input_data.years
    g_terminal = input_data.terminal_growth_estimate

    low_g, high_g = -0.20, 0.40  # -20% to +40% growth range
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

    if implied_g < 0.02:
        verdict = "🔴 PESSIMISTIC – Market expects almost no growth"
    elif implied_g < 0.08:
        verdict = "🟡 MODERATE – Market expects steady but slow growth"
    elif implied_g < 0.15:
        verdict = "🟢 OPTIMISTIC – Market expects strong growth"
    else:
        verdict = "🚀 EUPHORIC – Market expects very high growth (be careful!)"

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
            f"annual cash flow growth over {n} years. If you believe growth will be higher, it's undervalued."
        ),
    )


# ----- LEVEL 1: FINANCIAL MODEL GENERATOR (endpoint) -----
@app.post("/api/v1/financial-model", response_model=ModelGeneratorOutput)
def generate_financial_model(assumptions: BusinessAssumptions):
    """Generate simplified financial statements from basic assumptions."""

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

    summary = (
        f"{assumptions.company_name} grows from ${assumptions.initial_revenue:,.0f} to ${final_year.revenue:,.0f} "
        f"revenue ({total_growth:.0f}% growth). Year {assumptions.years_to_project} net income: ${final_year.net_income:,.0f}."
    )

    return ModelGeneratorOutput(company_name=assumptions.company_name, projections=projections, summary=summary)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


@app.post("/api/v1/monte-carlo", response_model=MonteCarloOutput)
async def monte_carlo_simulation(input_data: MonteCarloInput):
    """
    Runs thousands of scenarios with random growth rates.
    Returns probability distribution of outcomes.
    """
    
    def run_one_simulation(sim_id: int) -> float:
        """Run one random scenario and return final year net income"""
        revenue = input_data.base_revenue
        
        for year in range(input_data.years):
            # Random growth rate from normal distribution
            growth = random.gauss(input_data.revenue_growth_mean, input_data.revenue_growth_std)
            # Cap growth at -50% to +100% to keep realistic
            growth = max(-0.5, min(1.0, growth))
            
            revenue = revenue * (1 + growth)
            
            # Simple P&L for this year
            cogs = revenue * input_data.cogs_percentage
            gross_profit = revenue - cogs
            op_ex = revenue * input_data.op_ex_percentage
            op_income = gross_profit - op_ex
            # No taxes for simplicity
            net_income = max(0, op_income)  # Can't lose more than zero (limited liability)
        
        return net_income
    
    # Run simulations (can be slow for 10k+)
    outcomes = []
    for i in range(input_data.simulations):
        result = run_one_simulation(i)
        outcomes.append(result)
    
    # Calculate statistics
    outcomes_sorted = sorted(outcomes)
    mean_val = sum(outcomes) / len(outcomes)
    median_val = outcomes_sorted[len(outcomes_sorted) // 2]
    p10_val = outcomes_sorted[int(len(outcomes_sorted) * 0.1)]
    p90_val = outcomes_sorted[int(len(outcomes_sorted) * 0.9)]
    positive_count = sum(1 for x in outcomes if x > 0)
    prob_positive = positive_count / len(outcomes)
    
    # Sample outcomes for charting (keep all for frontend)
    # But limit to 1000 for response size
    sampled_outcomes = outcomes[:1000] if len(outcomes) > 1000 else outcomes
    
    return MonteCarloOutput(
        total_simulations=input_data.simulations,
        mean_net_income=round(mean_val, 0),
        median_net_income=round(median_val, 0),
        p10_net_income=round(p10_val, 0),
        p90_net_income=round(p90_val, 0),
        probability_positive=round(prob_positive * 100, 1),
        worst_case=round(min(outcomes), 0),
        best_case=round(max(outcomes), 0),
        all_outcomes=sampled_outcomes
    )


# ----- LEVEL 6: M&A ACCRETION/DILUTION MODEL -----

class CompanyFinancials(BaseModel):
    net_income: float = Field(..., description="Annual net income")
    shares_outstanding: float = Field(..., gt=0, description="Number of shares")
    eps: float = Field(default=0, description="Earnings per share (calculated if not provided)")

class MAndAInput(BaseModel):
    buyer: CompanyFinancials
    target: CompanyFinancials
    
    # Deal terms
    purchase_price: float = Field(..., gt=0, description="Total consideration paid")
    cash_percent: float = Field(0.50, ge=0.0, le=1.0, description="% paid in cash")
    stock_percent: float = Field(0.50, ge=0.0, le=1.0, description="% paid in stock")
    buyer_stock_price: float = Field(..., gt=0, description="Buyer's current stock price")
    
    # Synergies and costs
    synergies: float = Field(0, description="Annual cost savings after merger")
    transaction_costs: float = Field(0, description="One-time deal fees")
    
    # Tax
    tax_rate: float = Field(0.21, ge=0.0, le=0.40)

class MAndAOutput(BaseModel):
    buyer_standalone_eps: float
    target_standalone_eps: float
    pro_forma_net_income: float
    pro_forma_shares: float
    pro_forma_eps: float
    accretion_dilution_percent: float
    verdict: str  # "ACC RETIVE" or "DILUTIVE" (misspelled for weirdness)
    explanation: str

@app.post("/api/v1/m-and-a", response_model=MAndAOutput)
def m_and_a_model(input_data: MAndAInput):
    """
    Merger model: Calculates if deal increases (accretive) or decreases (dilutive) EPS.
    """
    # Calculate EPS if not provided
    buyer_eps = input_data.buyer.eps if input_data.buyer.eps > 0 else input_data.buyer.net_income / input_data.buyer.shares_outstanding
    target_eps = input_data.target.eps if input_data.target.eps > 0 else input_data.target.net_income / input_data.target.shares_outstanding
    
    # Step 1: Combined pro-forma net income
    # Buyer NI + Target NI + Synergies - Transaction Costs (after tax)
    pro_forma_ni = (
        input_data.buyer.net_income + 
        input_data.target.net_income + 
        input_data.synergies
    )
    
    # Subtract transaction costs (one-time, after tax)
    after_tax_transaction_costs = input_data.transaction_costs * (1 - input_data.tax_rate)
    pro_forma_ni -= after_tax_transaction_costs
    
    # Step 2: New shares issued if paying with stock
    stock_consideration = input_data.purchase_price * input_data.stock_percent
    new_shares_issued = stock_consideration / input_data.buyer_stock_price
    
    pro_forma_shares = input_data.buyer.shares_outstanding + new_shares_issued
    
    # Step 3: Pro-forma EPS
    pro_forma_eps = pro_forma_ni / pro_forma_shares if pro_forma_shares > 0 else 0
    
    # Step 4: Accretion/Dilution calculation
    eps_change = pro_forma_eps - buyer_eps
    accretion_dilution_percent = (eps_change / buyer_eps) * 100
    
    # Step 5: Verdict
    if accretion_dilution_percent > 0:
        verdict = "🟢 ACCRETIVE (+" + str(round(accretion_dilution_percent, 2)) + "%)"
        verdict_short = "ACCRETIVE"
    elif accretion_dilution_percent < 0:
        verdict = "🔴 DILUTIVE (" + str(round(accretion_dilution_percent, 2)) + "%)"
        verdict_short = "DILUTIVE"
    else:
        verdict = "⚪ NEUTRAL (0%)"
        verdict_short = "NEUTRAL"
    
    explanation = f"Buyer EPS: ${buyer_eps:.2f} → Pro-forma EPS: ${pro_forma_eps:.2f}. " \
                  f"Change: {accretion_dilution_percent:+.2f}%. {verdict_short} deal."
    
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
