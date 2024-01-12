'use strict';

module.exports = {
  extends: [
    'stylelint-config-recommended',
    /*
     * Prettier plugin is not needed
     * https://stylelint.io/migration-guide/to-15/#deprecated-stylistic-rules
     */
  ],
  rules: {
    'no-descending-specificity': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'layer', 'apply', 'config'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.svelte', '**/.svelte'],
      customSyntax: 'postcss-html',
    },
  ],
};
