/**
 * How to use:
 * EITHER Ctrl+Shift+P -> Wallaby.js: Select Configuration
 * OR Copy as wallaby.cjs to project root to test
 * using vitest.dom.config.ts.
 */

module.exports = function () {
  return {
    testFramework: {
      configFile: './vitest.dom.config.ts',
    },
    hints: {
      ignoreCoverageForFile: /Wallaby ignore file coverage/,
      ignoreCoverage: /Wallaby ignore coverage/,
    },
    trace: true,
  };
};
