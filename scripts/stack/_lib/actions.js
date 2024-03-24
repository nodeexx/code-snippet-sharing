import { execSync, spawn } from 'child_process';

import {
  displayDockerContainerLogs,
  startDockerizedStack,
  stopDockerizedStack,
  waitUntilDockerContainerExits,
  waitUntilDockerContainerHasHealthStatus,
} from './utils/docker.js';
import { sleep, waitUntilServiceIsAvailable } from './utils/misc.js';

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 * @param {string[]} dockerComposeUpOptions
 * @returns {Promise<void>}
 */
export async function startDockerizedInfra(
  paths,
  dockerComposeFiles,
  dockerComposeUpOptions = [],
) {
  console.log('infra (docker): starting');

  startDockerizedStack(paths, dockerComposeFiles, dockerComposeUpOptions);
  await waitUntilDockerContainerHasHealthStatus(
    `${process.env['PROJECT_NAME']}--postgres`,
    'healthy',
  );

  console.log('infra (docker): ready');
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 * @param {string[]} dockerComposeUpOptions
 * @returns {Promise<void>}
 */
export async function startDockerizedInfraApp(
  paths,
  dockerComposeFiles,
  dockerComposeUpOptions = [],
) {
  console.log('infra+migration+app (docker): starting');

  startDockerizedStack(paths, dockerComposeFiles, dockerComposeUpOptions);
  await waitUntilDockerContainerHasHealthStatus(
    `${process.env['PROJECT_NAME']}--app`,
    'healthy',
    20,
  );

  console.log('infra+migration+app (docker): ready');
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 * @param {string[]} dockerComposeUpOptions
 * @returns {Promise<number>} exit code of a container
 */
export async function startDockerizedE2E(
  paths,
  dockerComposeFiles,
  dockerComposeUpOptions = [],
) {
  console.log('infra+migration+app+e2e (docker): starting');

  startDockerizedStack(paths, dockerComposeFiles, dockerComposeUpOptions);
  await waitUntilDockerContainerHasHealthStatus(
    `${process.env['PROJECT_NAME']}--app`,
    'healthy',
    20,
  );
  const exitCode = waitUntilDockerContainerExits(
    `${process.env['PROJECT_NAME']}--e2e`,
  );
  displayDockerContainerLogs(`${process.env['PROJECT_NAME']}--e2e`);

  console.log('infra+migration+app+e2e (docker): finished');

  return exitCode;
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 * @param {string[]} dockerComposeUpOptions
 * @returns {Promise<number>} exit code of a container
 */
export async function startDockerizedApi(
  paths,
  dockerComposeFiles,
  dockerComposeUpOptions = [],
) {
  console.log('infra+migration+app+api (docker): starting');

  startDockerizedStack(paths, dockerComposeFiles, dockerComposeUpOptions);
  await waitUntilDockerContainerHasHealthStatus(
    `${process.env['PROJECT_NAME']}--app`,
    'healthy',
    20,
  );
  const exitCode = waitUntilDockerContainerExits(
    `${process.env['PROJECT_NAME']}--api`,
  );
  displayDockerContainerLogs(`${process.env['PROJECT_NAME']}--api`);

  console.log('infra+migration+app+api (docker): finished');

  return exitCode;
}

/**
 * @param {string} [options]
 */
export function performLocalMigration(options) {
  console.log('db: migrating (local)');

  const baseCommand = 'npm run db:migrate:dev';
  const command = options ? `${baseCommand} -- ${options}` : baseCommand;
  execSync(command, { stdio: 'inherit', env: process.env });

  console.log('db: migrated (local)');
}

export async function startLocalApp() {
  console.log('app (local): starting');

  // execSync('npm run dev:only > /dev/null &', { stdio: 'inherit' });
  spawn('npm', ['run', 'dev:only'], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  }).unref();
  await sleep(5000);

  try {
    await waitUntilServiceIsAvailable('http://localhost:3000');
  } catch (error) {
    console.error(error);
    console.error(`app (local): failed`);
    process.exit(1);
  }

  console.log('app (local): ready');
}

export function runLocalApp() {
  console.log('app (local): running');

  try {
    execSync(
      'npx vite dev | npx roarr --include-date true --output-format pretty', // pretty | json
      {
        stdio: 'inherit',
        shell: '/bin/bash',
        env: process.env,
      },
    );
  } catch (e) {
    console.log('app (local): exited');
  }
}

export function performLocalSeeding() {
  console.log('db: seeding (development, local)');
  execSync('npm run db:seed:development', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('db: seeded (development, local)');
}

/**
 * @param {string[]} playwrightArguments
 */
export function runLocalHeadlessE2E(playwrightArguments) {
  console.log('e2e (headless, local): starting');

  const playwrightArgumentsString = playwrightArguments.join(' ');
  execSync(`npm run test:e2e:only -- ${playwrightArgumentsString}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('e2e (headless, local): finished');
}

/**
 * @param {string[]} playwrightArguments
 */
export function runLocalHeadedE2E(playwrightArguments) {
  console.log('e2e (headed, local): starting');

  const playwrightArgumentsString = playwrightArguments.join(' ');
  execSync(`npm run test:e2e:headed:only -- ${playwrightArgumentsString}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('e2e (headed, local): finished');
}

/**
 * @param {string[]} playwrightArguments
 */
export function runLocalUiE2E(playwrightArguments) {
  console.log('e2e (ui, local): starting');

  const playwrightArgumentsString = playwrightArguments.join(' ');
  execSync(`npm run test:e2e:ui:only -- ${playwrightArgumentsString}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('e2e (ui, local): finished');
}

/**
 * @param {string[]} playwrightArguments
 */
export function runLocalCodegenE2E(playwrightArguments) {
  console.log('e2e (codegen, local): starting');

  const playwrightArgumentsString = playwrightArguments.join(' ');
  execSync(`npm run test:e2e:codegen:only -- ${playwrightArgumentsString}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('e2e (codegen, local): finished');
}

/**
 * @param {string[]} playwrightArguments
 */
export function runLocalHeadlessApi(playwrightArguments) {
  console.log('api (headless, local): starting');

  const playwrightArgumentsString = playwrightArguments.join(' ');
  execSync(`npm run test:api:only -- ${playwrightArgumentsString}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('api (headless, local): finished');
}

/**
 * @param {string[]} playwrightArguments
 */
export function runLocalUiApi(playwrightArguments) {
  console.log('api (ui, local): starting');

  const playwrightArgumentsString = playwrightArguments.join(' ');
  execSync(`npm run test:api:ui:only -- ${playwrightArgumentsString}`, {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('api (ui, local): finished');
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 */
export function stopDockerizedInfra(
  paths,
  dockerComposeFiles,
  removeVolumes = false,
) {
  console.log('infra (docker): stopping');

  stopDockerizedStack(paths, dockerComposeFiles, removeVolumes);

  console.log('infra (docker): stopped');
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 */
export function stopDockerizedInfraApp(
  paths,
  dockerComposeFiles,
  removeVolumes = false,
) {
  console.log('infra+app (docker): stopping');

  stopDockerizedStack(paths, dockerComposeFiles, removeVolumes);

  console.log('infra+app (docker): stopped');
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 */
export function stopDockerizedE2E(
  paths,
  dockerComposeFiles,
  removeVolumes = false,
) {
  console.log('infra+app+e2e (docker): stopping');

  stopDockerizedStack(paths, dockerComposeFiles, removeVolumes);

  console.log('infra+app+e2e (docker): stopped');
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 */
export function stopDockerizedApi(
  paths,
  dockerComposeFiles,
  removeVolumes = false,
) {
  console.log('infra+app+api (docker): stopping');

  stopDockerizedStack(paths, dockerComposeFiles, removeVolumes);

  console.log('infra+app+api (docker): stopped');
}

export function stopLocalApp() {
  try {
    console.log('app (local): stopping');
    const appPid = execSync(
      `ss -lnp | grep :3000 | sed 's/.*pid=\\(.*\\),.*/\\1/g'`,
      { env: process.env },
    )
      .toString()
      .trim();
    execSync(`kill -INT ${appPid}`, {
      stdio: ['pipe', 'ignore', 'ignore'],
      env: process.env,
    });
    console.log('app (local): stopped');
  } catch (error) {
    console.log('app (local): was not running');
  }
}
