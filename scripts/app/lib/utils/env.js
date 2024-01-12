/**
 * @param envVars {string[]}
 * @returns {void}
 */
export function throwIfEnvVarsNotSet(envVars) {
  envVars.forEach((envVar) => {
    if (!isEnvVarSet(envVar)) {
      throw new Error(`Environment variable ${envVar} must be set.`);
    }
  });
}

/**
 * @param envVar {string}
 * @returns {boolean}
 */
function isEnvVarSet(envVar) {
  return ![undefined, ''].includes(process.env[envVar]);
}
