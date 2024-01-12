import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/server/core/config';

export const GET = (async () => {
  let status = 'OK';
  if (config.isMaintenanceMode) {
    status = 'maintenance';
  }

  return json({ status });
}) satisfies RequestHandler;
