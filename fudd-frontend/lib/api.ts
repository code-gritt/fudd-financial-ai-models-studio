import { useAuthStore } from "@/store/authStore";

export type ApiHealth = { status: string };

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  initials: string;
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

