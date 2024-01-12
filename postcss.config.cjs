'use strict';

const config = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    // Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    tailwindcss: {},
    'postcss-preset-env': {
      // https://cssdb.org/
      stage: 2,
      features: { 'nesting-rules': false },
    },
    // Should be the last plugin
    autoprefixer: {},
  },
};

module.exports = config;
