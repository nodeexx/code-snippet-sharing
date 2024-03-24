import { describe, expect, it } from 'vitest';

import {
  getMockAuthRequest,
  getMockAuthSession,
} from '$lib/shared/lucia/testing';

import {
  getCurrentAuthSession,
  getCurrentAuthUserFromRequest,
  getCurrentAuthUserFromSession,
} from './index';

describe(getCurrentAuthSession.name, () => {
  it('should return null if request contains invalid, expired, or no session ID', async () => {
    const mockAuthRequest = getMockAuthRequest();

    expect(await getCurrentAuthSession(mockAuthRequest)).toBeNull();
  });

  it('should return AuthSession if request contains valid session ID', async () => {
    const mockAuthSession = getMockAuthSession();
    const mockAuthRequest = getMockAuthRequest(mockAuthSession);

    expect(await getCurrentAuthSession(mockAuthRequest)).toEqual(
      mockAuthSession,
    );
  });
});

describe(getCurrentAuthUserFromSession.name, () => {
  it('should return null if passed null', async () => {
    expect(getCurrentAuthUserFromSession(null)).toBeNull();
  });

  it('should return AuthUser from passed AuthSession', async () => {
    const mockAuthSession = getMockAuthSession();

    expect(getCurrentAuthUserFromSession(mockAuthSession)).toEqual(
      mockAuthSession.user,
    );
  });
});

describe(getCurrentAuthUserFromRequest.name, () => {
  it('should return null if request contains invalid, expired, or no session ID', async () => {
    const mockAuthRequest = getMockAuthRequest();

    expect(await getCurrentAuthUserFromRequest(mockAuthRequest)).toBeNull();
  });

  it('should return AuthSession if request contains valid session ID', async () => {
    const mockAuthSession = getMockAuthSession();
    const mockAuthRequest = getMockAuthRequest(mockAuthSession);

    expect(await getCurrentAuthUserFromRequest(mockAuthRequest)).toEqual(
      mockAuthSession.user,
    );
  });
});
