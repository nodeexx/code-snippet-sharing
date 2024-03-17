import { posthog } from '$lib/client/posthog';
import { getSessionId } from '$lib/client/posthog/utils';
import type { LoggerContext } from '$lib/shared/logging/types';
import type { LogLevelName } from '../types';

export const logLevels = {
  debug: 10,
  log: 20,
  info: 30,
  warn: 40,
  error: 50,
} as const;

/*
 * Colors copied from https://github.com/gajus/roarr-browser-log-writer
 */
export const logLevelColors = {
  debug: {
    backgroundColor: '#666',
    color: '#fff',
  },
  error: {
    backgroundColor: '#f05033',
    color: '#fff',
  },
  info: {
    backgroundColor: '#3174f1',
    color: '#fff',
  },
  log: {
    backgroundColor: '#712bde',
    color: '#fff',
  },
  warn: {
    backgroundColor: '#f5a623',
    color: '#000',
  },
} satisfies {
  [key in LogLevelName]: { backgroundColor: string; color: string };
};

/*
 * Colors copied from https://github.com/gajus/roarr-browser-log-writer
 */
export const logTimestampColors = {
  debug: {
    color: '#999',
  },
  error: {
    color: '#ff1a1a',
  },
  info: {
    color: '#3291ff',
  },
  log: {
    color: '#8367d3',
  },
  warn: {
    color: '#f7b955',
  },
} satisfies {
  [key in LogLevelName]: { color: string };
};

export function enrichLoggerContextWithPosthogSessionId(
  context: LoggerContext,
): LoggerContext {
  if (!posthog) {
    return { ...context };
  }

  const sessionId = getSessionId();
  if (!sessionId) {
    return { ...context };
  }

  return {
    ...context,
    posthogSessionId: getSessionId(),
  };
}
