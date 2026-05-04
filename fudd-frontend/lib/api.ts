import { useAuthStore } from "@/store/authStore";

export type ApiHealth = { status: string };

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  initials: string;
}

export interface DebtSchedule {
  year: number;
  beginning_balance: number;
  interest: number;
  principal_payment: number;
  ending_balance: number;
}

export interface LBOInput {
  ebitda: number;
  ebitda_growth_rate: number;
  purchase_ebitda_multiple: number;
  exit_ebitda_multiple: number;
  senior_debt_percent: number;
  senior_interest_rate: number;
  sub_debt_percent: number;
  sub_interest_rate: number;
  holding_period_years: number;
  initial_equity_percent: number;
}

export interface LBOOutput {
  purchase_price: number;
  total_debt: number;
  initial_equity: number;
  exit_ebitda: number;
  exit_enterprise_value: number;
  exit_debt_balance: number;
  exit_equity_value: number;
  irr_percent: number;
  cash_on_cash_return: number;
  debt_schedule: DebtSchedule[];
  summary: string;
}

export interface MonteCarloInput {
  base_revenue: number;
  revenue_growth_mean: number;
  revenue_growth_std: number;
  years: number;
  simulations: number;
  cogs_percentage: number;
  op_ex_percentage: number;
}

export interface MonteCarloOutput {
  total_simulations: number;
  mean_net_income: number;
  median_net_income: number;
  p10_net_income: number;
  p90_net_income: number;
  probability_positive: number;
  worst_case: number;
  best_case: number;
  all_outcomes: number[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function parseJsonOrText(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

/**
 * Run LBO Model
 */
export async function apiLbo(input: LBOInput): Promise<LBOOutput> {
  return apiFetch<LBOOutput>("/api/v1/lbo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

/**
 * Run Monte Carlo Simulation
 */
export async function apiMonteCarlo(input: MonteCarloInput): Promise<MonteCarloOutput> {
  return apiFetch<MonteCarloOutput>("/api/v1/monte-carlo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = useAuthStore.getState().token;
  
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await parseJsonOrText(response);
    const message =
      typeof body === "string" ? body : JSON.stringify(body ?? {});
    throw new Error(`API ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
}

export function getHealth(): Promise<ApiHealth> {
  return apiFetch<ApiHealth>("/health");
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
}

