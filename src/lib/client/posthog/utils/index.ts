import { posthog } from '../client';

export function getSessionId(): string | undefined {
  return posthog?.get_session_id();
}
