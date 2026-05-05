from fastapi import APIRouter, HTTPException
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
from app.models.financial_logic import (
    run_lbo_model, run_comps_analysis, run_reverse_dcf,
    run_m_and_a_model, run_financial_model_gen
)
from app.engine.monte_carlo import run_monte_carlo
from app.engine.backtester import run_backtest

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

@router.post("/backtest", response_model=BacktestOutput)
def backtest_endpoint(input_data: BacktestInput):
    try:
        return run_backtest(input_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
