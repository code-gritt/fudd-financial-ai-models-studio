from pydantic import BaseModel, Field
from typing import Dict, List, Optional

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

# ----- LBO MODELS -----
class LBOInput(BaseModel):
    ebitda: float = Field(..., gt=0, description="Current year EBITDA")
    ebitda_growth_rate: float = Field(0.05, ge=-0.20, le=0.30)
    purchase_ebitda_multiple: float = Field(8.0, ge=4.0, le=15.0)
    exit_ebitda_multiple: float = Field(8.0, ge=4.0, le=15.0)
    senior_debt_percent: float = Field(0.50, ge=0.0, le=0.80)
    senior_interest_rate: float = Field(0.08, ge=0.04, le=0.15)
    sub_debt_percent: float = Field(0.25, ge=0.0, le=0.50)
    sub_interest_rate: float = Field(0.12, ge=0.06, le=0.20)
    holding_period_years: int = Field(5, ge=3, le=7)
    initial_equity_percent: float = Field(0.25, ge=0.10, le=0.40)

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
    cash_on_cash_return: float
    debt_schedule: List[DebtSchedule]
    summary: str

# ----- COMPS MODELS -----
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

# ----- FINANCIAL MODEL GENERATOR MODELS -----
class BusinessAssumptions(BaseModel):
    company_name: str = "My Company"
    initial_revenue: float = Field(..., gt=0)
    revenue_growth_rate: float = Field(0.10, ge=-0.5, le=2.0)
    cogs_percentage: float = Field(0.40, ge=0.0, le=1.0)
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

# ----- MONTE CARLO MODELS -----
class MonteCarloInput(BaseModel):
    base_revenue: float = Field(..., gt=0)
    revenue_growth_mean: float = Field(0.10)
    revenue_growth_std: float = Field(0.05)
    years: int = Field(5, ge=1, le=10)
    simulations: int = Field(1000, ge=100, le=100000)
    cogs_percentage: float = Field(0.40)
    op_ex_percentage: float = Field(0.30)

class MonteCarloOutput(BaseModel):
    total_simulations: int
    mean_net_income: float
    median_net_income: float
    p10_net_income: float
    p90_net_income: float
    probability_positive: float
    worst_case: float
    best_case: float
    all_outcomes: List[float]

# ----- REVERSE DCF MODELS -----
class ReverseDCFInput(BaseModel):
    current_stock_price: float = Field(..., gt=0)
    free_cash_flow_per_share: float = Field(..., gt=0)
    discount_rate: float = Field(0.10, ge=0.05, le=0.20)
    years: int = Field(5, ge=1, le=10)
    terminal_growth_estimate: float = Field(0.03, ge=0.0, le=0.05)

class ReverseDCFOutput(BaseModel):
    implied_growth_rate: float
    justified_stock_price: float
    verdict: str
    explanation: str

# ----- M&A MODELS -----
class CompanyFinancials(BaseModel):
    net_income: float
    shares_outstanding: float
    eps: float = Field(default=0)

class MAndAInput(BaseModel):
    buyer: CompanyFinancials
    target: CompanyFinancials
    purchase_price: float
    cash_percent: float
    stock_percent: float
    buyer_stock_price: float
    synergies: float = Field(0)
    transaction_costs: float = Field(0)
    tax_rate: float = Field(0.21)

class MAndAOutput(BaseModel):
    buyer_standalone_eps: float
    target_standalone_eps: float
    pro_forma_net_income: float
    pro_forma_shares: float
    pro_forma_eps: float
    accretion_dilution_percent: float
    verdict: str
    explanation: str

# ----- BACKTEST MODELS -----
class BacktestInput(BaseModel):
    ticker: str = Field("SPY", description="Stock ticker to backtest")
    start_date: str = Field("2023-01-01")
    end_date: str = Field("2024-01-01")
    short_window: int = Field(20)
    long_window: int = Field(50)
    initial_capital: float = Field(10000.0)

class BacktestPerformance(BaseModel):
    total_return_percent: float
    annualized_return_percent: float
    sharpe_ratio: float
    max_drawdown_percent: float
    win_rate: float
    rmse: float
    mae: float

class BacktestOutput(BaseModel):
    ticker: str
    performance: BacktestPerformance
    equity_curve: List[float]
    signals: List[Dict[str, str]]
