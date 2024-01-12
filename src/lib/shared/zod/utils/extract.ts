import type { ZodError } from 'zod';

export function extractZodErrorPaths(error: ZodError): (string | number)[][] {
  const errorPaths = error.issues.map((issue) => issue.path);

  return errorPaths;
}
