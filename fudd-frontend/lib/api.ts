/**
 * API Types & Functions for FUDD Finance
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// --- Shared Types ---
export interface User {
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

// --- LBO Types ---
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

// --- Monte Carlo Types ---
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

// --- Reverse DCF Types ---
export interface ReverseDCFInput {
  current_stock_price: number;
  free_cash_flow_per_share: number;
  discount_rate: number;
  years: number;
  terminal_growth_estimate: number;
}

export interface ReverseDCFOutput {
  implied_growth_rate: number;
  justified_stock_price: number;
  verdict: string;
  explanation: string;
}

// --- Comps Types ---
export interface CompanyMetrics {
  revenue: number;
  ebitda: number;
  net_income: number;
}

export interface CompsInput {
  target_company: CompanyMetrics;
  comparable_companies: CompanyMetrics[];
}

export interface CompsOutput {
  implied_valuation_range: Record<string, number>;
  multiples_used: Record<string, number>;
  explanation: string;
}

// --- M&A Types ---
export interface CompanyFinancials {
  net_income: number;
  shares_outstanding: number;
  eps?: number;
}

export interface MAndAInput {
  buyer: CompanyFinancials;
  target: CompanyFinancials;
  purchase_price: number;
  cash_percent: number;
  stock_percent: number;
  buyer_stock_price: number;
  synergies: number;
  transaction_costs: number;
  tax_rate: number;
}

export interface MAndAOutput {
  buyer_standalone_eps: number;
  target_standalone_eps: number;
  pro_forma_net_income: number;
  pro_forma_shares: number;
  pro_forma_eps: number;
  accretion_dilution_percent: number;
  verdict: string;
  explanation: string;
}

// --- Auth Types ---
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// --- Helper Functions ---

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof document !== 'undefined' ? 
    document.cookie.split('; ').find(row => row.startsWith('fudd-auth-token='))?.split('=')[1] : null;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export async function getHealth() {
  return apiFetch<{ status: string }>("/");
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  return apiFetch<LoginResponse>("/api/v1/login", {
    method: "POST",
    body: params,
  });
}

export async function apiLbo(input: LBOInput): Promise<LBOOutput> {
  return apiFetch<LBOOutput>("/api/v1/lbo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function apiMonteCarlo(input: MonteCarloInput): Promise<MonteCarloOutput> {
  return apiFetch<MonteCarloOutput>("/api/v1/monte-carlo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function apiReverseDCF(input: ReverseDCFInput): Promise<ReverseDCFOutput> {
  return apiFetch<ReverseDCFOutput>("/api/v1/reverse-dcf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function apiComps(input: CompsInput): Promise<CompsOutput> {
  return apiFetch<CompsOutput>("/api/v1/comps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function apiMAndA(input: MAndAInput): Promise<MAndAOutput> {
  return apiFetch<MAndAOutput>("/api/v1/m-and-a", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
