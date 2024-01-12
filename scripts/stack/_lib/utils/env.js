import dotenv from 'dotenv';

/**
 * @param {string} envFileAbsolutePath
 * @param {string[]} envVars - Mandatory environment variables to check
 */
export function loadAndCheckEnvVars(envFileAbsolutePath, envVars) {
  dotenv.config({
    path: envFileAbsolutePath,
    // override: true,
    // debug: true,
  });
  exitIfEnvVarsNotSet(envVars);
}

/**
 * @param {string[]} envVars
 * @returns {void}
 */
export function exitIfEnvVarsNotSet(envVars) {
  /** @type {string[]} */
  const notSetEnvVars = [];
  envVars.forEach((envVar) => {
    if (!isEnvVarSet(envVar)) {
      notSetEnvVars.push(envVar);
    }
  });

  if (notSetEnvVars.length > 0) {
    console.log(
      `The following environment variables are not set: ${notSetEnvVars.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }
}

/**
 * @param {string} envVar
 * @returns {boolean}
 */
function isEnvVarSet(envVar) {
  return ![undefined, ''].includes(process.env[envVar]);
}
