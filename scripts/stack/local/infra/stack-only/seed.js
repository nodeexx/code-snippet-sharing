#!/usr/bin/env node

import { program } from 'commander';
import { loadAndCheckEnvVars } from '../../../_lib/utils/env.js';
import { getPaths } from '../../../_lib/utils/paths.js';
import { performLocalSeeding } from '../../../_lib/actions.js';
import { ENV_FILE } from './_lib/constants.js';
import { MANDATORY_ENV_VARS } from '../_lib/constants.js';

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function main() {
  const scriptPath = /** @type {string} */ (process.argv[1]);

  const paths = getPaths(scriptPath, ENV_FILE);
  const { scriptRelativePath, scriptName, envFileAbsolutePath } = paths;

  program
    .name(scriptName)
    .description('...')
    .on('option:unknown', (unknownOptionArgs) => {
      console.error(`Unknown option: ${unknownOptionArgs[0]}`);
      process.exit(1);
    })
    .addHelpText(
      'after',
      `
Examples:
    ${scriptRelativePath}
        ...
`,
    )
    .parse(process.argv);

  loadAndCheckEnvVars(envFileAbsolutePath, MANDATORY_ENV_VARS);
  performLocalSeeding();
}
