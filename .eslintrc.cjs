module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    project: './tsconfig.json',
    extraFileExtensions: ['.svelte'],
  },
  plugins: [
    '@typescript-eslint',
    'import-no-duplicates-prefix-resolved-path',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.cjs', '.js', '.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    // Useful for triggering Svelte reactivity
    'no-self-assign': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      extends: ['plugin:svelte/recommended', 'plugin:svelte/prettier'],
      rules: {},
    },
    {
      files: ['**/*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      // No `.spec.{js,ts}` files, because those are for server unit tests
      files: ['src/**/*.{test,browser-test}.{js,ts}'],
      plugins: ['testing-library'],
      extends: ['plugin:testing-library/dom', 'plugin:jest-dom/recommended'],
      rules: {
        'jest-dom/prefer-in-document': 'off',
        'testing-library/prefer-screen-queries': 'off',
      },
    },
  ],
};
