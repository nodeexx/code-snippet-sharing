#!/usr/bin/env node

import { execSync } from 'child_process';
import { program } from 'commander';

import { startDockerizedApi } from '../../../_lib/actions.js';
import { loadAndCheckEnvVars } from '../../../_lib/utils/env.js';
import { getPaths } from '../../../_lib/utils/paths.js';
import { MANDATORY_ENV_VARS } from '../_lib/constants.js';
import { DOCKER_COMPOSE_FILES, ENV_FILE } from './_lib/constants.js';

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function main() {
  const scriptPath = /** @type {string} */ (process.argv[1]);

  const paths = getPaths(scriptPath, ENV_FILE);
  const {
    scriptDirectoryAbsolutePath,
    scriptRelativePath,
    scriptName,
    envFileAbsolutePath,
  } = paths;

  program
    .name(scriptName)
    .description('...')
    .option('-l, --leave-stack-up', 'Leave stack up after test run')
    .on('option:unknown', (unknownOptionArgs) => {
      console.error(`Unknown option: ${unknownOptionArgs[0]}`);
      process.exit(1);
    })
    .addHelpText(
      'after',
      `
Additional options:
  --    All options following this option will be sent
        to \`docker compose up\` command

Examples:
    ${scriptRelativePath}
        ...
`,
    )
    .parse(process.argv);

  loadAndCheckEnvVars(envFileAbsolutePath, MANDATORY_ENV_VARS);
  const exitCode = await startDockerizedApi(paths, DOCKER_COMPOSE_FILES);

  if (program.opts()['leaveStackUp']) {
    console.log(
      `Stack is left running. Stop it with \`${scriptDirectoryAbsolutePath}/down.js\``,
    );
    process.exit(exitCode);
  }

  execSync(`${scriptDirectoryAbsolutePath}/down.js`, {
    stdio: 'inherit',
  });

  process.exit(exitCode);
}
