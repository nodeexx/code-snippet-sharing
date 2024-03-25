import { json } from '@sveltejs/kit';

import { config } from '$lib/server/core/config';

import type { RequestHandler } from './$types';

export const GET = (() => {
  let status = 'OK';
  if (config.isMaintenanceMode) {
    status = 'maintenance';
  }

  return json({ status });
}) satisfies RequestHandler;
