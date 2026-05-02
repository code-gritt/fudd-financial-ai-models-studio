from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import math

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