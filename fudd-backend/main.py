from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List
from math import pow
import random
import asyncio
from typing import List, Optional

app = FastAPI(title="FUDD Finance", description="Weird finance models that work")


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