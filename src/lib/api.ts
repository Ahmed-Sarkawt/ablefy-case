/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Thin fetch wrapper for the local API. Errors come back as `{ error, field? }`.
 */

export interface ApiError {
  error: string;
  field?: string | null;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public payload: ApiError
  ) {
    super(payload.error);
    this.name = 'ApiRequestError';
  }
}

export async function apiPost<TRes>(path: string, body: unknown): Promise<TRes> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({ error: 'Network error' }))) as ApiError;
    throw new ApiRequestError(res.status, payload);
  }
  return (await res.json()) as TRes;
}
