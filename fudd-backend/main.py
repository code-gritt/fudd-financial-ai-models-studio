from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import math
from pydantic import BaseModel, Field  # Add Field here

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

# ----- LEVEL 3: COMPARABLE COMPANY ANALYSIS -----
@app.post("/api/v1/comps", response_model=CompsOutput)
def comparable_company_analysis(input_data: CompsInput):
    """
    Calculates valuation based on similar companies.
    Example: Your pizza shop vs 5 other pizza shops that sold recently.
    """
    target = input_data.target_company
    comps = input_data.comparable_companies
    
    if not comps:
        raise HTTPException(status_code=400, detail="Need at least 1 comparable company")
    
    # Calculate average multiples from comparable companies
    avg_ev_revenue = sum(c.revenue for c in comps) / len(comps) / (sum(c.revenue for c in comps) / len(comps)) if comps[0].revenue > 0 else 1
    # Actually let's do it properly:
    ev_revenue_list = []
    pe_list = []
    
    for comp in comps:
        if comp.revenue > 0:
            ev_revenue_list.append(comp.revenue / comp.revenue)  # Simplified: EV/Revenue ratio
        if comp.net_income > 0:
            pe_list.append(comp.revenue / comp.net_income)  # Simplified P/E
    
    avg_ev_rev = sum(ev_revenue_list) / len(ev_revenue_list) if ev_revenue_list else 1
    avg_pe = sum(pe_list) / len(pe_list) if pe_list else 10
    
    # Apply to target
    valuation_by_revenue = target.revenue * avg_ev_rev
    valuation_by_earnings = target.net_income * avg_pe
    
    return CompsOutput(
        implied_valuation_range={
            "low": min(valuation_by_revenue, valuation_by_earnings),
            "high": max(valuation_by_revenue, valuation_by_earnings)
        },
        multiples_used={
            "ev_revenue": round(avg_ev_rev, 2),
            "pe_ratio": round(avg_pe, 2)
        },
        explanation=f"Based on {len(comps)} comparable companies, your target is worth between ${min(valuation_by_revenue, valuation_by_earnings):,.0f} and ${max(valuation_by_revenue, valuation_by_earnings):,.0f}"
    )

# ----- HEALTH CHECK -----
@app.get("/")
def root():
    return {"message": "FUDD is alive. Finance models loading...", "status": "weird but working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    # ----- LEVEL 2: REVERSE DCF (Implied Growth Calculator) -----
from math import pow

class ReverseDCFInput(BaseModel):
    current_stock_price: float = Field(..., gt=0, description="Current share price")
    free_cash_flow_per_share: float = Field(..., gt=0, description="Last 12 months FCF per share")
    discount_rate: float = Field(0.10, ge=0.05, le=0.20, description="Required return (usually 8-12%)")
    years: int = Field(5, ge=1, le=10, description="Forecast period in years")
    terminal_growth_estimate: float = Field(0.03, ge=0.0, le=0.05, description="Long-term growth after forecast (usually 2-4%)")

class ReverseDCFOutput(BaseModel):
    implied_growth_rate: float
    justified_stock_price: float
    verdict: str
    explanation: str

@app.post("/api/v1/reverse-dcf", response_model=ReverseDCFOutput)
def reverse_dcf_calculator(input_data: ReverseDCFInput):
    """
    Works backwards: Given a stock price, what growth rate does the market expect?
    If you think growth will be higher → buy. Lower → sell.
    """
    price = input_data.current_stock_price
    fcf = input_data.free_cash_flow_per_share
    r = input_data.discount_rate
    n = input_data.years
    g_terminal = input_data.terminal_growth_estimate
    
    # Binary search for implied growth rate
    # (Because solving for growth directly is complex)
    low_g, high_g = -0.20, 0.40  # -20% to +40% growth range
    tolerance = 0.001
    iterations = 50
    
    for _ in range(iterations):
        mid_g = (low_g + high_g) / 2
        
        # Calculate present value of cash flows with this growth
        pv = 0
        for year in range(1, n + 1):
            # FCF grows at mid_g each year, discounted at r
            fcf_year = fcf * pow(1 + mid_g, year)
            pv += fcf_year / pow(1 + r, year)
        
        # Terminal value at year n (perpetuity)
        terminal_fcf = fcf * pow(1 + mid_g, n + 1)
        terminal_value = terminal_fcf / (r - g_terminal)
        pv_terminal = terminal_value / pow(1 + r, n)
        
        total_value = pv + pv_terminal
        
        if total_value > price:
            high_g = mid_g  # Need lower growth
        else:
            low_g = mid_g   # Need higher growth
    
    implied_g = (low_g + high_g) / 2
    
    # Generate verdict
    if implied_g < 0.02:
        verdict = "🔴 PESSIMISTIC – Market expects almost no growth"
    elif implied_g < 0.08:
        verdict = "🟡 MODERATE – Market expects steady but slow growth"
    elif implied_g < 0.15:
        verdict = "🟢 OPTIMISTIC – Market expects strong growth"
    else:
        verdict = "🚀 EUPHORIC – Market expects very high growth (be careful!)"
    
    # Calculate justified price at implied growth
    justified_price = 0
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
        explanation=f"With current price of ${price:,.2f}, the market expects {round(implied_g * 100, 2)}% annual cash flow growth over {n} years. If you believe growth will be higher, it's undervalued."
    )