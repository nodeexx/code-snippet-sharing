import { sentry } from '$lib/shared/sentry';
import { getTraceId } from '$lib/shared/sentry/utils';
import callsites from 'callsites';
import type { LoggerContext } from '../types';

export function enrichLoggerContextWithSentryTraceId<T extends LoggerContext>(
  context: T,
): T {
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

export function enrichContextWithDebugInfo(
  context: LoggerContext = {},
  rootFolder = '',
  stackLevel: number = 3,
): LoggerContext {
  return {
    ...context,
    callName: getCallName(stackLevel),
    fileName: getFileName(rootFolder, stackLevel),
  };
}

function getCallName(stackLevel: number = 3): string {
  const typeName = callsites()[stackLevel]?.getTypeName() ?? '';
  const functionName =
    callsites()[3]?.getFunctionName() ??
    callsites()[stackLevel]?.getMethodName() ??
    '';

  if (typeName) {
    return `${typeName}.${functionName}`;
  }

  return functionName;
}

function getFileName(rootFolder = '', stackLevel: number = 3): string {
  const fileName =
    callsites()[stackLevel]?.getFileName() ??
    callsites()[stackLevel]?.getEvalOrigin() ??
    '';

  return fileName.replace(rootFolder, '');
}
