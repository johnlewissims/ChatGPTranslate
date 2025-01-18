import globals from 'globals';
import pluginJs from '@eslint/js';

import prettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        ...globals.serviceworker,
      },
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        { singleQuote: true, printWidth: 80, endOfLine: 'auto' },
      ],
      'no-var': ['error'],
    },
  },
  {
    ignores: ['**/node_modules/**/*', '**/dist/**/*'],
  },
];
