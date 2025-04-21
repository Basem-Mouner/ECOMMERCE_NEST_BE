// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off', // تعطيل تحذير unsafe assignment
      '@typescript-eslint/no-unsafe-return': 'off', // تعطيل تحذير unsafe return
      '@typescript-eslint/no-unused-vars': 'off', // تعطيل تحذير unused vars
      'no-unused-vars': 'off', // تعطيل تحذير unused vars
        // Allow trailing spaces
    'no-trailing-spaces': 'off', // or 0

    // Allow more than two consecutive empty lines (e.g., up to 5)
    'no-multiple-empty-lines': ['warn', { max: 5 }],

    // You might have other rules configured here
    },
  },
);