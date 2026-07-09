'use client';

import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

const TOKEN_KEY = 'kaam25_auth_token';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [organizationClient()],
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

export function getStoredAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export const { useSession, useActiveOrganization, signIn, signUp, signOut } = authClient;
