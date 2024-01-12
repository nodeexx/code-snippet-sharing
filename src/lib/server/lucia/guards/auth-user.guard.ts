import {
  ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
  encodeOriginalPath,
} from '$lib/shared/core/utils';
import { redirect } from '@sveltejs/kit';

export function guardAuthUser(locals: App.Locals, url: URL): App.PageData {
  if (locals.authUser) {
    return {
      authUser: locals.authUser,
      doesRequireAuth: true,
    };
  }

  const encodedOriginalPath = encodeOriginalPath(url);
  const redirectPath = `/sign-in?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=${encodedOriginalPath}`;
  throw redirect(307, redirectPath);
}
