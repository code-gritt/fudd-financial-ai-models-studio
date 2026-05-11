import ollama
import yfinance as yf
import pandas as pd

def get_stock_analysis(ticker: str) -> dict:
    """
    Use LLM (deepseek-r1) to analyze a stock and provide trading insights
    """
    # 1. Get current stock data
    stock = yf.Ticker(ticker)
    info = stock.info
    
    # 2. Get recent price data
    hist = stock.history(period="5d")
    current_price = hist['Close'].iloc[-1] if not hist.empty else 0
    price_change = ((hist['Close'].iloc[-1] / hist['Close'].iloc[0]) - 1) * 100 if len(hist) > 0 else 0
    
    # 3. Get key fundamentals (if available)
    fundamentals = {
        "pe_ratio": info.get("trailingPE", "N/A"),
        "market_cap": info.get("marketCap", "N/A"),
        "52_week_high": info.get("fiftyTwoWeekHigh", "N/A"),
        "52_week_low": info.get("fiftyTwoWeekLow", "N/A"),
        "dividend_yield": info.get("dividendYield", "N/A"),
    }
    
    # 4. Build prompt for LLM
    prompt = f"""You are a quantitative finance analyst. Analyze this stock and provide a trading recommendation.

Ticker: {ticker}
Current Price: ${current_price:.2f}
5-Day Price Change: {price_change:.1f}%
P/E Ratio: {fundamentals['pe_ratio']}
Market Cap: {fundamentals['market_cap']}
52-Week Range: ${fundamentals['52_week_low']} - ${fundamentals['52_week_high']}

Provide a structured analysis with:
1. Sentiment (BULLISH/BEARISH/NEUTRAL)
2. Key insights (2-3 bullet points)
3. Recommended action (BUY/SELL/HOLD)
4. Confidence level (0-100%)

Keep it concise. Be specific about numbers."""
    
    # 5. Call Ollama
    try:
        response = ollama.chat(
            model="deepseek-r1:7b",
            messages=[{"role": "user", "content": prompt}],
            stream=False
        )
        
        analysis = response['message']['content']
        
        # 6. Extract simple signal from analysis
        signal = "NEUTRAL"
        if "BULLISH" in analysis.upper() or "BUY" in analysis.upper():
            signal = "BUY"
        elif "BEARISH" in analysis.upper() or "SELL" in analysis.upper():
            signal = "SELL"
        
        return {
            "ticker": ticker,
            "current_price": round(current_price, 2),
            "price_change_percent": round(price_change, 1),
            "signal": signal,
            "analysis": analysis,
            "fundamentals": fundamentals
        }
        
    except Exception as e:
        return {
            "ticker": ticker,
            "error": str(e),
            "message": "Ollama not running. Start with 'ollama serve'"
        }
