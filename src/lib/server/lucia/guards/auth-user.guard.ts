import { redirect } from '@sveltejs/kit';

import {
  encodeOriginalPath,
  ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
} from '$lib/shared/core/utils';

export function guardAuthUser(locals: App.Locals, url: URL): App.PageData {
  if (locals.authUser) {
    return {
      authUser: locals.authUser,
    };
  }

  const encodedOriginalPath = encodeOriginalPath(url);
  const redirectPath = `/sign-in?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=${encodedOriginalPath}`;
  throw redirect(307, redirectPath);
}
