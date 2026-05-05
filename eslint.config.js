/** @license MIT */
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  { ignores: ['dist', 'node_modules', 'server/db/*.db', '**/*.cjs', 'prototype/.vite/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsparser, ecmaVersion: 2022, sourceType: 'module' },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#(?!fff|000|FFF|000)[0-9a-fA-F]{3,6}$/]',
          message: 'Hex color literals are not allowed. Use a token from tokens.css.',
        },
      ],
    },
    settings: { react: { version: '18' } },
  },
];
