'use client';

import { createAuthClient } from 'better-auth/react';

const TOKEN_KEY = 'kaam25_auth_token';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    // Capture the bearer token Better Auth issues on sign-in/sign-up.
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get('set-auth-token');
      if (token) localStorage.setItem(TOKEN_KEY, token);
    },
    // Attach it to every subsequent request.
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem(TOKEN_KEY) ?? '',
    },
  },
});

export function clearStoredAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const { useSession, signIn, signUp, signOut } = authClient;
