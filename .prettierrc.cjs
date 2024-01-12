'use strict';

module.exports = {
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
  singleQuote: true,
  trailingComma: 'all',
  svelteSortOrder: 'options-scripts-markup-styles',
  svelteStrictMode: true,
  svelteIndentScriptAndStyle: false,
};
