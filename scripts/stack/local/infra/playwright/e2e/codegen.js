#!/usr/bin/env node

import { program } from 'commander';
import { loadAndCheckEnvVars } from '../../../../_lib/utils/env.js';
import { getPaths } from '../../../../_lib/utils/paths.js';
import {
  performLocalMigration,
  runLocalCodegenE2E,
  startDockerizedInfra,
  startLocalApp,
} from '../../../../_lib/actions.js';
import { ENV_FILE } from '../_lib/constants.js';
import { execSync } from 'child_process';
import {
  DOCKER_COMPOSE_FILES,
  MANDATORY_ENV_VARS,
} from '../../_lib/constants.js';

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function main() {
  const scriptPath = /** @type {string} */ (process.argv[1]);

  const paths = getPaths(scriptPath, ENV_FILE);
  const {
    scriptDirectoryParentAbsolutePath,
    scriptRelativePath,
    scriptDirectoryParentRelativePath,
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
  await startDockerizedInfra(paths, DOCKER_COMPOSE_FILES);
  performLocalMigration();
  await startLocalApp();

  console.log(
    'Close the browser after finishing - stack will be automatically stopped.',
  );
  console.log(
    `If stopped using Ctrl+C, stack will be left running - stop it with \`${scriptDirectoryParentRelativePath}/down.js\``,
  );
  runLocalCodegenE2E(program.args);

  if (program.opts()['leaveStackUp']) {
    console.log(
      `Stack is left running. Stop it with \`${scriptDirectoryParentRelativePath}/down.js\``,
    );
    process.exit(0);
  }

  execSync(`${scriptDirectoryParentAbsolutePath}/down.js`, {
    stdio: 'inherit',
  });
}
