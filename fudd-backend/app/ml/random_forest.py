import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import yfinance as yf


def get_ml_signal(ticker: str, lookback_days: int = 500):
    """
    Predict if stock will go UP or DOWN tomorrow using Random Forest

    Returns: "BUY" if predicted UP, "SELL" if predicted DOWN, confidence %
    """
    # 1. Download data
    df = yf.download(ticker, period=f"{lookback_days}d", progress=False, auto_adjust=True)

    if df.empty:
        return {"signal": "ERROR", "confidence": 0, "message": "No data found"}

    # 2. Create features (what the model learns from)
    df['returns_1d'] = df['Close'].pct_change(1)
    df['returns_5d'] = df['Close'].pct_change(5)
    df['returns_10d'] = df['Close'].pct_change(10)
    df['volatility'] = df['returns_1d'].rolling(20).std()
    df['sma_10'] = df['Close'].rolling(10).mean()
    df['sma_30'] = df['Close'].rolling(30).mean()
    df['sma_ratio'] = df['sma_10'] / df['sma_30']

    # 3. Create target: 1 if price goes UP tomorrow, 0 if DOWN
    df['target'] = (df['Close'].shift(-1) > df['Close']).astype(int)

    # 4. Drop NaN values
    df = df.dropna()

    if len(df) < 100:
        return {"signal": "ERROR", "confidence": 0, "message": "Not enough data"}

    # 5. Select features (X) and target (y)
    feature_cols = ['returns_1d', 'returns_5d', 'returns_10d', 'volatility', 'sma_ratio']
    X = df[feature_cols]
    y = df['target']

    # 6. Train Random Forest (first 80% of data, predict last 20%)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 7. Get latest features for prediction
    latest_features = X.iloc[-1:].values
    prediction = model.predict(latest_features)[0]
    confidence = model.predict_proba(latest_features)[0].max()

    signal = "BUY" if prediction == 1 else "SELL"

    return {
        "ticker": ticker,
        "signal": signal,
        "confidence": round(confidence * 100, 1),
        "predicted_direction": "UP" if prediction == 1 else "DOWN",
        "training_data_points": len(df),
        "model_accuracy": round(model.score(X_test, y_test) * 100, 1)
    }
