import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * Base ESLint rules shared by every app and package in the monorepo.
 * Framework-specific rules (React, Next, etc.) live in sibling presets
 * and extend this array — see ./react.js
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow underscore-prefixed args/vars to signal "intentionally unused"
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // We rely on TypeScript itself for exhaustive typing; keep `any` a warning, not an error,
      // so it's visible in review without blocking early development.
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Must be last — disables stylistic ESLint rules that conflict with Prettier.
  eslintConfigPrettier,
  {
    ignores: ['dist/**', '.next/**', 'node_modules/**', '.turbo/**', 'target/**'],
  },
);
