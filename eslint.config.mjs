/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Важно: добавили next/core-web-vitals!
  ...compat.extends(
    'next/core-web-vitals',
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ),

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser, // ← теперь это объект, а не строка
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    rules: {
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function' },
      ],
      'import/prefer-default-export': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-unresolved': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'import/extensions': 'off',
      'class-methods-use-this': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true },
      ],
      'react/require-default-props': 'off',
      quotes: [
        'error',
        'double',
        { avoidEscape: true },
      ],
      'react/jsx-filename-extension': [
        'warn',
        { extensions: ['.tsx'] },
      ],
      'implicit-arrow-linebreak': 'off',
      semi: ['error', 'always'],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
