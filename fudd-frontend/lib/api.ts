export type ApiHealth = { status: string };

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
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Accept: "application/json",
    },
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

