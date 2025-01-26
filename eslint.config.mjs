import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
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
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  tseslint.configs.recommended,
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
);
