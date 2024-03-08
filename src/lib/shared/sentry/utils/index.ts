import { sentry } from '../client';
import type { SpanContextData } from '@sentry/types';

export function getTraceSpanId(): string | undefined {
  const { traceId, spanId } = getSpanContextData() || {};
  if (!traceId || !spanId) {
    return;
  }

  return `${traceId}-${spanId}`;
}

export function getTraceId(): string | undefined {
  const { traceId } = getSpanContextData() || {};
  return traceId;
}

export function getSpanId(): string | undefined {
  const { spanId } = getSpanContextData() || {};
  return spanId;
}

export function getSpanContextData(): SpanContextData | undefined {
  return sentry?.getActiveSpan()?.spanContext();
}
