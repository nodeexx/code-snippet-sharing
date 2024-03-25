import { error, redirect } from '@sveltejs/kit';

import { config } from '$lib/server/core/config';
import { decodeOriginalPath } from '$lib/shared/core/utils';

import type { PageServerLoad } from './$types';

export const load = (({ url, setHeaders }) => {
  if (config.isMaintenanceMode) {
    setHeaders({
      'Retry-After': '600',
    });
    throw error(503);
  }

  const originalPath = decodeOriginalPath(url);
  if (originalPath) {
    throw redirect(307, originalPath);
  }

  throw redirect(307, '/');
}) satisfies PageServerLoad;
