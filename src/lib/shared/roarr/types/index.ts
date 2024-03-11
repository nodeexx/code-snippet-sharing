/**
 * Types partially copied from `node_modules/roarr/src/types.ts`.
 * Don't import from `node_modules/roarr/src/types.ts` directly to avoid type errors.
 */

import type { LogLevelName } from 'roarr';

export type LoggerLoggingMethodName =
  | LoggerLoggingMethodNameNoOnce
  | LoggerLoggingMethodNameOnce;
export type JsonObject = {
  [k: string]: JsonValue;
};

type LoggerLoggingMethodNameNoOnce = LogLevelName;
type LoggerLoggingMethodNameOnce = `${LoggerLoggingMethodNameNoOnce}Once`;

type JsonValue =
  | JsonObject
  | JsonValue[]
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | null
  | undefined;
