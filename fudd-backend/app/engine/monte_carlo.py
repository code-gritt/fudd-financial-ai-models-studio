from __future__ import annotations

import random
import statistics
from typing import Iterable

from app.core.schemas import MonteCarloInput, MonteCarloOutput


def _percentile(sorted_values: list[float], percent: float) -> float:
    if not sorted_values:
        return 0.0
    if percent <= 0:
        return float(sorted_values[0])
    if percent >= 100:
        return float(sorted_values[-1])

    k = (len(sorted_values) - 1) * (percent / 100.0)
    f = int(k)
    c = min(f + 1, len(sorted_values) - 1)
    if f == c:
        return float(sorted_values[f])
    d0 = sorted_values[f] * (c - k)
    d1 = sorted_values[c] * (k - f)
    return float(d0 + d1)


def _sample(values: list[float], max_items: int) -> list[float]:
    if len(values) <= max_items:
        return values
    return random.sample(values, max_items)

def run_monte_carlo(input_data: MonteCarloInput) -> MonteCarloOutput:
    """
    Pure-Python Monte Carlo simulation (no NumPy dependency).
    """
    mean_growth = input_data.revenue_growth_mean
    std_growth = input_data.revenue_growth_std

    net_incomes: list[float] = []
    for _ in range(input_data.simulations):
        cumulative_growth = 1.0
        for _year in range(input_data.years):
            shock = random.gauss(mean_growth, std_growth)
            shock = max(-0.5, min(1.0, shock))
            cumulative_growth *= 1.0 + shock

        final_revenue = input_data.base_revenue * cumulative_growth
        cogs = final_revenue * input_data.cogs_percentage
        gross_profit = final_revenue - cogs
        op_ex = final_revenue * input_data.op_ex_percentage
        op_income = gross_profit - op_ex
        net_incomes.append(float(op_income if op_income > 0 else 0.0))

    sorted_net = sorted(net_incomes)
    mean_val = statistics.fmean(net_incomes) if net_incomes else 0.0
    median_val = statistics.median(sorted_net) if net_incomes else 0.0
    p10_val = _percentile(sorted_net, 10)
    p90_val = _percentile(sorted_net, 90)

    prob_positive = (sum(1 for x in net_incomes if x > 0) / len(net_incomes) * 100.0) if net_incomes else 0.0
    sampled_outcomes = _sample(net_incomes, 1000)
        
    return MonteCarloOutput(
        total_simulations=input_data.simulations,
        mean_net_income=float(round(mean_val, 0)),
        median_net_income=float(round(median_val, 0)),
        p10_net_income=float(round(p10_val, 0)),
        p90_net_income=float(round(p90_val, 0)),
        probability_positive=float(round(prob_positive, 1)),
        worst_case=float(round(sorted_net[0] if sorted_net else 0.0, 0)),
        best_case=float(round(sorted_net[-1] if sorted_net else 0.0, 0)),
        all_outcomes=sampled_outcomes
    )
