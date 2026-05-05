from __future__ import annotations

import math
import statistics
from typing import Iterable


def calculate_sharpe_ratio(returns: Iterable[float], risk_free_rate: float = 0.02) -> float:
    """
    Calculates the Sharpe Ratio: (Mean Return - Risk Free Rate) / Std Dev of Return.
    Assumes annual returns.
    """
    returns_list = list(returns)
    if len(returns_list) < 2:
        return 0.0
    mean_return = statistics.fmean(returns_list)
    std_return = statistics.pstdev(returns_list)
    if std_return == 0:
        return 0.0
    return (mean_return - risk_free_rate) / std_return

def calculate_sortino_ratio(
    returns: Iterable[float],
    risk_free_rate: float = 0.02,
    target_return: float = 0,
) -> float:
    """
    Calculates the Sortino Ratio: (Mean Return - Risk Free Rate) / Downside Deviation.
    Downside deviation only considers negative returns relative to the target.
    """
    returns_list = list(returns)
    if len(returns_list) < 2:
        return 0.0
    mean_return = statistics.fmean(returns_list)
    downside_returns = [r for r in returns_list if r < target_return]
    if len(downside_returns) < 2:
        return 0.0
    downside_std = statistics.pstdev(downside_returns)
    if downside_std == 0:
        return 0.0
    return (mean_return - risk_free_rate) / downside_std

def calculate_max_drawdown(equity_curve: Iterable[float]) -> float:
    """
    Calculates the Maximum Drawdown (MDD) of an equity curve.
    MDD = (Peak - Trough) / Peak
    """
    curve = list(equity_curve)
    if len(curve) < 2:
        return 0.0

    peak = curve[0]
    max_drawdown = 0.0
    for value in curve[1:]:
        if value > peak:
            peak = value
            continue
        if peak > 0:
            drawdown = (value - peak) / peak
            if drawdown < max_drawdown:
                max_drawdown = drawdown
    return float(max_drawdown)
