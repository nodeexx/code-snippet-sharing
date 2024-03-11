import { Roarr, logLevels, type LogLevelName } from 'roarr';
import callsites from 'callsites';
import { config } from '$lib/server/core/config';
import type {
  LoggerContext,
  LoggerContextWithError,
  LoggerLoggingMethodName,
} from './types';
import { serializeError } from 'serialize-error';
import { sentry } from '../sentry';
import { getTraceId } from '../sentry/utils';

export const roarr = (function () {
  const createLogger = (methodName: LoggerLoggingMethodName) => {
    return (message: string, context: LoggerContextWithError = {}) => {
      if (!shouldBeLogged(methodName)) {
        return;
      }

      let contextClone = serializeErrorInContext(context);
      contextClone = enrichContextWithSentryTraceId(contextClone);

      Roarr[methodName](
        config.roarr.isDebugContextShown
          ? enrichContextWithDebugInfo(contextClone)
          : contextClone,
        message,
      );
    };
  };

  const roarrLoggingMethodNamesNoOnce = Object.keys(Roarr).filter((property) =>
    Object.keys(logLevels).includes(property),
  ) as LoggerLoggingMethodName[];
  const roarrLoggingMethodNamesOnce = roarrLoggingMethodNamesNoOnce.map(
    (methodName) => `${methodName}Once` as LoggerLoggingMethodName,
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
      LoggerLoggingMethodName,
      (message: string, context?: LoggerContextWithError) => void
    >,
  );

  return roarrLogger;
})();

function shouldBeLogged(methodName: LoggerLoggingMethodName): boolean {
  const requestedLogLevelName = methodName.replace('Once', '') as LogLevelName;
  const requestedLogLevel = logLevels[requestedLogLevelName];
  const minLogLevel = logLevels[config.roarr.minLogLevel as LogLevelName];

  return requestedLogLevel >= minLogLevel;
}

function serializeErrorInContext(
  context: LoggerContextWithError,
): LoggerContext {
  const errorContext = context.error;
  if (!errorContext || !(errorContext instanceof Error)) {
    return { ...context } as LoggerContext;
  }

  return {
    ...context,
    error: serializeError(errorContext),
  };
}

function enrichContextWithSentryTraceId(context: LoggerContext): LoggerContext {
  if (!sentry) {
    return { ...context };
  }

  const traceId = getTraceId();
  if (!traceId) {
    return { ...context };
  }

  return {
    ...context,
    sentryTraceId: traceId,
  };
}

function enrichContextWithDebugInfo(
  context: LoggerContext = {},
): LoggerContext {
  return {
    ...context,
    callName: getCallName(),
    fileName: getFileName(),
  };
}

function getCallName(): string {
  const typeName = callsites()[3]?.getTypeName() ?? '';
  const functionName =
    callsites()[3]?.getFunctionName() ?? callsites()[3]?.getMethodName() ?? '';

  if (typeName) {
    return `${typeName}.${functionName}`;
  }

  return functionName;
}

function getFileName(): string {
  const fileName =
    callsites()[3]?.getFileName() ?? callsites()[3]?.getEvalOrigin() ?? '';

  return fileName.replace(config.folders.root, '');
}
