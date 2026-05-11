from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.schemas import (
    LoginRequest, LoginResponse, UserProfile,
    LBOInput, LBOOutput,
    CompsInput, CompsOutput,
    ReverseDCFInput, ReverseDCFOutput,
    MonteCarloInput, MonteCarloOutput,
    MAndAInput, MAndAOutput,
    BusinessAssumptions, ModelGeneratorOutput,
    BacktestInput, BacktestOutput
)
from app.ml.random_forest import get_ml_signal
from app.ml.llm_analyzer import get_stock_analysis
from app.models.financial_logic import (
    run_lbo_model, run_comps_analysis, run_reverse_dcf,
    run_m_and_a_model, run_financial_model_gen
)
from app.engine.monte_carlo import run_monte_carlo

router = APIRouter(prefix="/api/v1")

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    if request.username != "SUPER" or request.password != "PASS123":
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return LoginResponse(
        access_token="fake-jwt-token-for-fudd",
        user=UserProfile(
            id="user-123",
            username=request.username,
            email=f"{request.username}@fudd.finance",
            full_name="Super User",
            initials="SU"
        )
    )

@router.post("/lbo", response_model=LBOOutput)
def lbo_endpoint(input_data: LBOInput):
    return run_lbo_model(input_data)

@router.post("/comps", response_model=CompsOutput)
def comps_endpoint(input_data: CompsInput):
    return run_comps_analysis(input_data)

@router.post("/reverse-dcf", response_model=ReverseDCFOutput)
def reverse_dcf_endpoint(input_data: ReverseDCFInput):
    return run_reverse_dcf(input_data)

@router.post("/financial-model", response_model=ModelGeneratorOutput)
def financial_model_endpoint(assumptions: BusinessAssumptions):
    return run_financial_model_gen(assumptions)

@router.post("/monte-carlo", response_model=MonteCarloOutput)
def monte_carlo_endpoint(input_data: MonteCarloInput):
    return run_monte_carlo(input_data)

@router.post("/m-and-a", response_model=MAndAOutput)
def m_and_a_endpoint(input_data: MAndAInput):
    return run_m_and_a_model(input_data)

class MLSignalInput(BaseModel):
    ticker: str
    lookback_days: int = 500

class MLSignalOutput(BaseModel):
    ticker: str
    signal: str
    confidence: float
    predicted_direction: str
    training_data_points: int
    model_accuracy: float

@router.post("/ml/signal", response_model=MLSignalOutput)
async def ml_signal(input_data: MLSignalInput):
    """ML-powered buy/sell signal using Random Forest"""
    result = get_ml_signal(input_data.ticker, input_data.lookback_days)
    if result.get("signal") == "ERROR":
        raise HTTPException(status_code=400, detail=result.get("message", "ML signal error"))
    return result

# Short alias that’s easier to spot/call.
@router.post("/ml-signal", response_model=MLSignalOutput, include_in_schema=True)
async def ml_signal_alias(input_data: MLSignalInput):
    return await ml_signal(input_data)

@router.post("/backtest", response_model=BacktestOutput)
def backtest_endpoint(input_data: BacktestInput):
    try:
        from app.engine.backtester import run_backtest
        return run_backtest(input_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class LLMAnalysisInput(BaseModel):
    ticker: str

class LLMAnalysisOutput(BaseModel):
    ticker: str
    current_price: float
    price_change_percent: float
    signal: str
    analysis: str
    fundamentals: dict

@router.post("/ai/analyze", response_model=LLMAnalysisOutput)
async def ai_analyze(input_data: LLMAnalysisInput):
    """
    AI-powered stock analysis using local LLM (deepseek-r1)
    Provides trading signal and detailed reasoning
    """
    result = get_stock_analysis(input_data.ticker)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["message"])
    return result
