import type { ApiResponse } from '@kaam25/types';
import { getStoredAuthToken } from './auth-client';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();

  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const body: ApiResponse<T> = await response.json();

  if (!body.success) {
    throw new Error(body.error.message);
  }
  return body.data;
}
