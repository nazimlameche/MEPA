import js from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    rules: {
      'no-console':      'warn',
      'no-unused-vars':  ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prefer-const':    'error',
      'no-var':          'error',
      eqeqeq:            ['error', 'always'],
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType:  'module',
      globals: {
        React: 'readonly',
      },
    },
  },
  {
    // Ignore generated / build output
    ignores: ['dist/**', 'node_modules/**'],
  },
];
