import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Next.js ships its own flat-config preset (core-web-vitals + TypeScript
// rules tuned for the framework, e.g. no-img-element). We use that
// directly here rather than @kaam25/config/eslint/react, since Next-specific
// rules matter more for this app than staying identical to every other package.
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { ignores: ['next-env.d.ts', '.next/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];
