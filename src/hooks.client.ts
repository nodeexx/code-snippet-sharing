import { dev } from '$app/environment';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError = (async ({ error }) => {
  // TODO: Add crashalytics

  const message = 'Internal Client Error';
  if (dev) {
    console.error(message, error);
  }

  return {
    message,
    status: 500,
  };
}) satisfies HandleClientError;
