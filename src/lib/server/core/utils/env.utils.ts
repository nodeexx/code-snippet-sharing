import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export function exitIfEnvVarsNotSet(
  envVars: string[],
  envType: 'private' | 'public' = 'private',
): void {
  const notSetEnvVars: string[] = [];
  envVars.forEach((envVar) => {
    if (!isEnvVarSet(envVar, envType)) {
      notSetEnvVars.push(envVar);
    }
  });

  if (notSetEnvVars.length > 0) {
    const envTypeString = envType.charAt(0).toUpperCase() + envType.slice(1);
    console.error(
      `The following ${envTypeString} environment variables are not set: ${notSetEnvVars.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }
}

export function throwIfEnvVarsNotSet(
  envVars: string[],
  envType: 'private' | 'public' = 'private',
): void {
  envVars.forEach((envVar) => {
    if (!isEnvVarSet(envVar, envType)) {
      const envTypeString = envType.charAt(0).toUpperCase() + envType.slice(1);
      throw new Error(
        `${envTypeString} environment variable ${envVar} must be set.`,
      );
    }
  });
}

function isEnvVarSet(
  envVar: string,
  envType: 'private' | 'public' = 'private',
): boolean {
  let env: any = privateEnv;
  if (envType === 'public') {
    env = publicEnv;
  }

  return ![undefined, ''].includes(env[envVar]);
}
