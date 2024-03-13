import type { Handle } from '@sveltejs/kit';
import { roarr } from '$lib/server/roarr';
import { config } from '$lib/server/core/config';

export const httpLogHandle = (async ({ event, resolve }) => {
  if (!config.roarr.isAccessLoggingEnabled) {
    return resolve(event);
  }

  const requestTimestamp = Date.now();
  const response = await resolve(event);
  const responseTimeInMs = Date.now() - requestTimestamp;

  const { method, url, headers: requestHeaders } = event.request;
  const { status, headers: responseHeaders } = response;

  const contentLengthBytesString = responseHeaders.get('content-length');
  const contentLengthInBytes: number | null =
    Number(contentLengthBytesString) || 0;

  roarr.info('Access log', {
    logType: 'http',
    request: {
      address: event.getClientAddress(),
      userId: event.locals.authUser?.userId ?? null,
      userAgent: requestHeaders.get('user-agent'),
      method,
      url,
      route: event.route.id,
      referrer: requestHeaders.get('referer') ?? requestHeaders.get('referrer'),
    },
    response: {
      status: status,
      contentLengthInBytes,
      responseTimeInMs,
    },
  });

  return response;
}) satisfies Handle;
