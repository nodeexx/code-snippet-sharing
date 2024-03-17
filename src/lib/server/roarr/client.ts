import { Roarr, logLevels, type LogLevelName } from 'roarr';
import { config } from '$lib/server/core/config';
import type {
  ServerLoggerContext,
  ServerLoggerContextWithError,
  ServerLoggerLoggingMethodName,
} from './types';
import { serializeError } from 'serialize-error';
import { sentry } from '$lib/shared/sentry';
import type { SeverityLevel } from '$lib/shared/sentry/types';
import {
  enrichContextWithDebugInfo,
  enrichLoggerContextWithSentryTraceId,
} from '$lib/shared/logging/utils';

export const roarr = (function () {
  const createLogger = (methodName: ServerLoggerLoggingMethodName) => {
    return (
      message: string,
      context: ServerLoggerContextWithError = {},
      stackLevel: number = 3,
    ) => {
      if (!shouldBeLogged(methodName)) {
        return;
      }

      let contextClone = serializeErrorInContext(context);
      contextClone = enrichContextWithLogType(contextClone);
      contextClone = enrichLoggerContextWithSentryTraceId(contextClone);

      Roarr[methodName](
        config.roarr.isDebugContextShown
          ? enrichContextWithDebugInfo(
              contextClone,
              config.folders.root,
              stackLevel,
            )
          : contextClone,
        message,
      );

      sentry?.addBreadcrumb({
        type: 'default',
        category: 'console',
        message: JSON.stringify({ message, context: contextClone }),
        level: convertLogLevelNameRoarrToSentry(methodName),
      });
    };
  };

  const roarrLoggingMethodNamesNoOnce = Object.keys(Roarr).filter((property) =>
    Object.keys(logLevels).includes(property),
  ) as ServerLoggerLoggingMethodName[];
  const roarrLoggingMethodNamesOnce = roarrLoggingMethodNamesNoOnce.map(
    (methodName) => `${methodName}Once` as ServerLoggerLoggingMethodName,
  );
  const roarrLoggingMethodNames = [
    ...roarrLoggingMethodNamesNoOnce,
    ...roarrLoggingMethodNamesOnce,
  ];
  const roarrLogger = roarrLoggingMethodNames.reduce(
    (acc, methodName) => {
      acc[methodName] = createLogger(methodName);
      return acc;
    },
    {} as Record<
      ServerLoggerLoggingMethodName,
      (
        message: string,
        context?: ServerLoggerContextWithError,
        stackLevel?: number,
      ) => void
    >,
  );

  return roarrLogger;
})();

function shouldBeLogged(methodName: ServerLoggerLoggingMethodName): boolean {
  const requestedLogLevelName = methodName.replace('Once', '') as LogLevelName;
  const requestedLogLevel = logLevels[requestedLogLevelName];
  const minLogLevel = logLevels[config.roarr.minLogLevel as LogLevelName];

  return requestedLogLevel >= minLogLevel;
}

function serializeErrorInContext(
  context: ServerLoggerContextWithError,
): ServerLoggerContext {
  const errorContext = context.error;
  if (!errorContext || !(errorContext instanceof Error)) {
    return { ...context } as ServerLoggerContext;
  }

  return {
    ...context,
    error: serializeError(errorContext),
  };
}

function enrichContextWithLogType(
  context: ServerLoggerContext,
): ServerLoggerContext {
  return {
    logType: 'app',
    ...context,
  };
}

function convertLogLevelNameRoarrToSentry(
  methodName: ServerLoggerLoggingMethodName,
): SeverityLevel {
  const methodNameWithoutOnce = methodName.replace('Once', '');

  switch (methodNameWithoutOnce) {
    case 'trace':
      return 'debug';
    case 'warn':
      return 'warning';
    default:
      return methodName as SeverityLevel;
  }
}
