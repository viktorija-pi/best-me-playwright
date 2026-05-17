import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'allure-results/**',
      'allure-report/**',
      'coverage/**',
      'dist/**',
    ],
  },

  js.configs.recommended,
  {
    files: ['scripts/**/*.ts', 'src/helper/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
];
