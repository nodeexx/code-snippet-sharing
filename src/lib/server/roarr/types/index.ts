/**
 * Types partially copied from `node_modules/roarr/src/types.ts`.
 * Don't import from `node_modules/roarr/src/types.ts` directly to avoid type errors.
 */

import type { LogLevelName } from 'roarr';

import type { LoggerContext } from '$lib/shared/logging/types';

export type ServerLoggerLoggingMethodName =
  | ServerLoggerLoggingMethodNameNoOnce
  | ServerLoggerLoggingMethodNameOnce;

export interface JsonObject {
  [k: string]: JsonValue;
}
export type JsonValue =
  | JsonObject
  | JsonValue[]
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | null
  | undefined;

export interface ServerLoggerContext extends JsonObject, LoggerContext {
  error?: JsonValue;
  sentryTraceId?: string;
}

export interface ServerLoggerContextWithError extends LoggerContext {
  error?: Error | JsonValue;
  sentryTraceId?: string;
  // WARN: Other properties should not have an `Error` type, but I don't know
  // how to enforce it in combination with the type of `error` property.
  [k: string]: Error | JsonValue;
}

type ServerLoggerLoggingMethodNameNoOnce = LogLevelName;
type ServerLoggerLoggingMethodNameOnce =
  `${ServerLoggerLoggingMethodNameNoOnce}Once`;
