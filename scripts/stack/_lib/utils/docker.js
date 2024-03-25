import { execSync } from 'child_process';

import { sleep } from './misc.js';

/**
 * @typedef {'starting' | 'healthy' | 'unhealthy' | 'none'} DockerContainerHealthStatus
 */

/**
 * @param {string[]} files
 * @param {string} parentPath
 * @returns {string}
 */
export function generateDockerComposeFileOptionsString(files, parentPath = '') {
  if (files.length === 0) {
    return '';
  }

  if (parentPath) {
    files = files.map((file) => `${parentPath}/${file}`);
  }

  return files.map((file) => `--file "${file}"`).join(' ');
}

/**
 * @param {string} containerName
 * @returns DockerContainerHealthStatus
 */
export function getDockerContainerHealthStatus(containerName) {
  /** @type {DockerContainerHealthStatus} */
  let healthStatus = 'starting';
  try {
    healthStatus = /** @type {DockerContainerHealthStatus} */ (
      execSync(
        `docker inspect -f {{.State.Health.Status}} "${containerName}"`,
        { stdio: ['pipe', 'pipe', 'ignore'] },
      )
        .toString()
        .trim()
    );
  } catch (e) {
    const error = /** @type {Error} */ (e);
    throw new Error(
      `Failed to get health status of ${containerName} container: ${error.message}`,
    );
  }

  return healthStatus;
}

/**
 * @param {string} envFileAbsolutePath
 * @param {string} dockerComposeFileOptionsString
 * @param {string} dockerComposeUpOptionsString
 */
export function execSyncDockerComposeUp(
  envFileAbsolutePath,
  dockerComposeFileOptionsString,
  dockerComposeUpOptionsString = '',
) {
  execSync(
    'docker compose' +
      `  --env-file "${envFileAbsolutePath}"` +
      `  ${dockerComposeFileOptionsString}` +
      '  up' +
      '    --build' +
      '    --detach' +
      `    ${dockerComposeUpOptionsString}`,
    { stdio: 'inherit' },
  );
}

/**
 * @param {string} envFileAbsolutePath
 * @param {string} dockerComposeFileOptionsString
 * @returns {void}
 */
export function execSyncDockerComposeDown(
  envFileAbsolutePath,
  dockerComposeFileOptionsString,
  removeVolumes = false,
) {
  execSync(
    'docker compose' +
      `  --env-file "${envFileAbsolutePath}"` +
      `  ${dockerComposeFileOptionsString}` +
      '  down' +
      `  ${removeVolumes ? '--volumes' : ''}`,
    { stdio: 'inherit' },
  );
}

/**
 * @param {string} containerName
 * @returns {number} exit code of a container
 */
export function waitUntilDockerContainerExits(containerName) {
  const errorCode = execSync(`docker wait "${containerName}"`)
    .toString()
    .trim();

  return parseInt(errorCode, 10);
}

/**
 * @param {string} containerName
 * @param {DockerContainerHealthStatus} healthStatus
 */
export async function waitUntilDockerContainerHasHealthStatus(
  containerName,
  healthStatus,
  maxRetries = 10,
  retryIntervalInMs = 1000,
) {
  let retries = 0;
  let currentHealthStatus = 'none';
  do {
    currentHealthStatus = getDockerContainerHealthStatus(containerName);
    if (currentHealthStatus === healthStatus) {
      return;
    }

    retries += 1;
    await sleep(retryIntervalInMs);
  } while (retries < maxRetries);

  throw new Error(
    `Timed out while getting ${containerName} container health status. Last status: ${currentHealthStatus}`,
  );
}

/**
 * @param {string} containerName
 */
export function displayDockerContainerLogs(containerName) {
  execSync(`docker container logs "${containerName}"`, { stdio: 'inherit' });
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 * @param {string[]} dockerComposeUpOptions
 */
export function startDockerizedStack(
  paths,
  dockerComposeFiles,
  dockerComposeUpOptions = [],
) {
  const dockerComposeFileOptionsString = generateDockerComposeFileOptionsString(
    dockerComposeFiles,
    paths.currentWorkingDirectoryAbsolutePath,
  );
  const dockerComposeUpOptionsString = dockerComposeUpOptions.join(' ');
  execSyncDockerComposeUp(
    paths.envFileAbsolutePath,
    dockerComposeFileOptionsString,
    dockerComposeUpOptionsString,
  );
}

/**
 * @param {{ currentWorkingDirectoryAbsolutePath: string, envFileAbsolutePath: string }} paths
 * @param {string[]} dockerComposeFiles
 */
export function stopDockerizedStack(
  paths,
  dockerComposeFiles,
  removeVolumes = false,
) {
  const dockerComposeFileOptionsString = generateDockerComposeFileOptionsString(
    dockerComposeFiles,
    paths.currentWorkingDirectoryAbsolutePath,
  );
  execSyncDockerComposeDown(
    paths.envFileAbsolutePath,
    dockerComposeFileOptionsString,
    removeVolumes,
  );
}
