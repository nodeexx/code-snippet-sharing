import type { AuthRequest } from 'lucia';
import type { AuthSession, AuthUser } from '$lib/shared/lucia/types';

/**
 * NOTE: Results of Lucia's AuthRequest.validate() are cached, so almost always
 * returns a cached session validation result.
 */
export async function getCurrentAuthSession(
  authRequest: AuthRequest,
): Promise<AuthSession | null> {
  // Validate and return session based on stored session ID.
  // Results are cached.
  return authRequest.validate();
}

export async function getCurrentAuthUserFromRequest(
  authRequest: AuthRequest,
): Promise<AuthUser | null> {
  const session = await getCurrentAuthSession(authRequest);
  return getCurrentAuthUserFromSession(session);
}

export function getCurrentAuthUserFromSession(
  session: AuthSession | null,
): AuthUser | null {
  return session?.user ?? null;
}
