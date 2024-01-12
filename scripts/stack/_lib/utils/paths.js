import { realpathSync } from 'fs';
import { basename, dirname } from 'path';

/**
 * @param {string} scriptPath
 * @param {string} envFile
 */
export function getPaths(scriptPath, envFile) {
  const currentWorkingDirectoryAbsolutePath = realpathSync('.');
  const scriptAbsolutePath = realpathSync(scriptPath);
  const scriptDirectoryAbsolutePath = dirname(scriptAbsolutePath);
  const scriptDirectoryParentAbsolutePath = dirname(
    scriptDirectoryAbsolutePath,
  );
  const scriptRelativePath = `./${scriptAbsolutePath.substring(
    currentWorkingDirectoryAbsolutePath.length + 1,
  )}`;
  const scriptDirectoryRelativePath = dirname(scriptRelativePath);
  const scriptDirectoryParentRelativePath = dirname(
    scriptDirectoryRelativePath,
  );
  const scriptName = basename(scriptRelativePath);

  const envFileAbsolutePath = `${currentWorkingDirectoryAbsolutePath}/${envFile}`;

  return {
    currentWorkingDirectoryAbsolutePath,
    scriptAbsolutePath,
    scriptDirectoryAbsolutePath,
    scriptDirectoryParentAbsolutePath,
    scriptRelativePath,
    scriptDirectoryRelativePath,
    scriptDirectoryParentRelativePath,
    scriptName,
    envFileAbsolutePath,
  };
}
