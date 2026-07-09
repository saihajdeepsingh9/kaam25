import type { ApiResponse } from '@kaam25/types';
import { getStoredAuthToken } from './auth-client';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // DELETE responses are 204 No Content — nothing to parse.
  if (response.status === 204) return undefined as T;

  const body: ApiResponse<T> = await response.json();

  if (!body.success) {
    throw new Error(body.error.message);
  }
  return body.data;
}
