import { config } from '$lib/client/core/config';
import type { LoggerContext } from '$lib/shared/logging/types';
import {
  enrichContextWithDebugInfo,
  enrichLoggerContextWithSentryTraceId,
} from '$lib/shared/logging/utils';

import type { LogLevelName } from './types';
import {
  enrichLoggerContextWithPosthogSessionId,
  logLevelColors,
  logLevels,
  logTimestampColors,
} from './utils';

export const logger = (function () {
  const createLogger = (methodName: LogLevelName) => {
    return (message: string, context: LoggerContext = {}, stackLevel = 3) => {
      if (!shouldBeLogged(methodName)) {
        return;
      }

      let contextClone = enrichLoggerContextWithSentryTraceId(context);
      contextClone = enrichLoggerContextWithPosthogSessionId(contextClone);

      console[methodName](
        ...createLogPrefixStrings(methodName),
        message,
        '\n',
        config.logger.isDebugContextShown
          ? enrichContextWithDebugInfo(
              contextClone,
              window.location.origin,
              stackLevel,
            )
          : contextClone,
      );

      // Sentry libraries automatically record breadcrumbs for console logs,
      // so there is not need to manually record them.
    };
  };

  const logger = Object.keys(logLevels).reduce(
    (acc, methodName) => {
      acc[methodName as LogLevelName] = createLogger(
        methodName as LogLevelName,
      );
      return acc;
    },
    {} as Record<
      LogLevelName,
      (message: string, context?: LoggerContext, stackLevel?: number) => void
    >,
  );

  return logger;
})();

function shouldBeLogged(logLevel: LogLevelName): boolean {
  const requestedLogLevel = logLevels[logLevel];
  const minLogLevel = logLevels[config.logger.minLogLevel as LogLevelName];

  return requestedLogLevel >= minLogLevel;
}

function createLogPrefixStrings(logLevel: LogLevelName): string[] {
  const currentUtcTime = new Date().toISOString();
  const logTimestampColor = logTimestampColors[logLevel];
  const logLevelColor = logLevelColors[logLevel];
  const logLevelCommonStyles =
    'font-weight: bold; padding: 2px 4px; border-radius: 2px;';

  return [
    `%c[${currentUtcTime}]%c\t%c${logLevel}%c\t:`,
    `color: ${logTimestampColor.color}; font-weight: bold;`,
    '',
    `background-color: ${logLevelColor.backgroundColor}; color: ${logLevelColor.color}; ${logLevelCommonStyles}`,
    '',
  ];
}
