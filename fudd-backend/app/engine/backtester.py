import yfinance as yf
import pandas as pd
import numpy as np
from app.core.schemas import BacktestInput, BacktestOutput, BacktestPerformance
from app.analytics.risk import calculate_sharpe_ratio, calculate_max_drawdown

def run_backtest(input_data: BacktestInput) -> BacktestOutput:
    """
    Runs a simple Moving Average Crossover backtest on a ticker.
    Uses yfinance for reliable data ingestion and Pandas for vectorized logic.
    """
    # Fetch Data
    lookback_days = input_data.long_window + 60  # Increased buffer
    start_dt = pd.to_datetime(input_data.start_date) - pd.Timedelta(days=lookback_days)
    
    # Use Ticker.history for more reliable data fetching in cloud environments
    ticker_obj = yf.Ticker(input_data.ticker)
    df = ticker_obj.history(
        start=start_dt.strftime('%Y-%m-%d'),
        end=input_data.end_date,
        interval="1d",
        auto_adjust=True,
        actions=False
    )
    
    if df.empty:
        # Fallback to download if history fails
        df = yf.download(
            input_data.ticker,
            start=start_dt.strftime('%Y-%m-%d'),
            end=input_data.end_date,
            progress=False,
            auto_adjust=True
        )

    if df.empty:
        raise ValueError(f"No data found for ticker {input_data.ticker} between {start_dt.date()} and {input_data.end_date}. This may be due to an invalid symbol or Yahoo Finance rate limiting.")
    
    # Handle potential multi-index columns from newer yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # Ensure we have the Close column
    if 'Close' not in df.columns:
        # Sometimes it's called 'Adj Close' but auto_adjust=True handles that usually
        if 'Adj Close' in df.columns:
            df['Close'] = df['Adj Close']
        else:
            raise ValueError(f"Required price data ('Close') not found for {input_data.ticker}")

    # Signal Generation (Vectorized)
    df['SMA_Short'] = df['Close'].rolling(window=input_data.short_window).mean()
    df['SMA_Long'] = df['Close'].rolling(window=input_data.long_window).mean()
    
    # Signal: 1 if short SMA > long SMA, else 0
    df['Signal'] = 0.0
    df.loc[df['SMA_Short'] > df['SMA_Long'], 'Signal'] = 1.0
    
    # Daily Returns
    df['Returns'] = df['Close'].pct_change()
    
    # Strategy Returns (Shift signal by 1 day to avoid lookahead bias)
    # We enter the trade at the close of the day the signal is generated, 
    # so we earn the return of the NEXT day.
    df['Strategy_Returns'] = df['Signal'].shift(1) * df['Returns']
    
    # Filter to requested date range using matching timezone awareness
    start_ts = pd.to_datetime(input_data.start_date)
    if df.index.tz is not None and start_ts.tzinfo is None:
        start_ts = start_ts.tz_localize(df.index.tz)
    df = df[df.index >= start_ts]
    
    if df.empty:
        raise ValueError("No data available for the specific date range selected.")

    # Equity Curve
    df['Equity_Curve'] = (1 + df['Strategy_Returns'].fillna(0)).cumprod() * input_data.initial_capital
    
    # performance Metrics
    total_return = (df['Equity_Curve'].iloc[-1] / input_data.initial_capital) - 1
    
    # Annualized Return
    days = (pd.to_datetime(input_data.end_date) - pd.to_datetime(input_data.start_date)).days
    annualized_return = (1 + total_return) ** (365 / days) - 1 if days > 0 else 0
    
    # Sharpe Ratio (Annualized)
    daily_returns = df['Strategy_Returns'].dropna()
    # Using 252 trading days for annualization
    sharpe = calculate_sharpe_ratio(daily_returns.values) * np.sqrt(252)
    
    # Max Drawdown
    mdd = calculate_max_drawdown(df['Equity_Curve'].values)
    
    # Win Rate
    win_rate = len(daily_returns[daily_returns > 0]) / len(daily_returns) if len(daily_returns) > 0 else 0
    
    # Signals (Buy/Sell events)
    df['Position_Change'] = df['Signal'].diff()
    buy_signals = df[df['Position_Change'] == 1]
    sell_signals = df[df['Position_Change'] == -1]
    
    signals = []
    for date in buy_signals.index:
        signals.append({"date": date.strftime('%Y-%m-%d'), "type": "BUY"})
    for date in sell_signals.index:
        signals.append({"date": date.strftime('%Y-%m-%d'), "type": "SELL"})
    
    # Sort signals by date
    signals.sort(key=lambda x: x['date'])
    
    return BacktestOutput(
        ticker=input_data.ticker,
        performance=BacktestPerformance(
            total_return_percent=float(round(total_return * 100, 2)),
            annualized_return_percent=float(round(annualized_return * 100, 2)),
            sharpe_ratio=float(round(sharpe, 2)),
            max_drawdown_percent=float(round(mdd * 100, 2)),
            win_rate=float(round(win_rate * 100, 1))
        ),
        equity_curve=df['Equity_Curve'].tolist(),
        signals=signals
    )
