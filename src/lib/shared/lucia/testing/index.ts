import dayjs from 'dayjs';
import type { AuthRequest } from 'lucia';
import { vi } from 'vitest';

import type { AuthSession, AuthUser } from '$lib/shared/lucia/types';

export function getMockAuthRequest(
  authSession: AuthSession | null = null,
): AuthRequest {
  return {
    validate: vi.fn().mockResolvedValue(authSession),
    setSession: vi.fn(),
  } as Partial<AuthRequest> as AuthRequest;
}

export function getMockAuthSession(
  overrides?: Partial<AuthSession> | undefined,
): AuthSession {
  const currentTimestamp = dayjs();
  const tommorowTimestamp = currentTimestamp.add(1, 'day');
  const timestampIn2Weeks = currentTimestamp.add(2, 'week');
  return {
    sessionId: 'mock-session-id',
    activePeriodExpiresAt: tommorowTimestamp.toDate(),
    idlePeriodExpiresAt: timestampIn2Weeks.toDate(),
    state: 'active',
    fresh: false,
    ...overrides,
    user: {
      ...getMockAuthUser(overrides?.user),
    },
  };
}

export function getMockAuthUser(
  overrides?: Partial<AuthUser> | undefined,
): AuthUser {
  return {
    email: 'mock-email',
    email_verified: true,
    userId: 'mock-user-id',
    created_at: new Date(),
    ...overrides,
  };
}
