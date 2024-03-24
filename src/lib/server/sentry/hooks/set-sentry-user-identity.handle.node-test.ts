import type { RequestEvent } from '@sveltejs/kit';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';

import { getMockWithType } from '$lib/shared/core/testing';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import * as libSharedSentryModule from '$lib/shared/sentry';

import { setSentryUserIdentity } from './set-sentry-user-identity.handle';

describe(setSentryUserIdentity.name, () => {
  let mockSetUser: Mock<any[], void>;
  let mockHandleResolve: Mock<any[], any>;

  beforeEach(() => {
    mockSetUser = vi.fn();
    mockHandleResolve = vi.fn();
    vi.spyOn(libSharedSentryModule, 'sentry', 'get').mockReturnValue(
      getMockWithType<typeof libSharedSentryModule.sentry>({
        setUser: mockSetUser,
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not set user identity if Sentry client is not configured', async () => {
    vi.spyOn(libSharedSentryModule, 'sentry', 'get').mockReturnValue(undefined);
    const event = getTypedEvent({});

    await setSentryUserIdentity({ event, resolve: mockHandleResolve });

    expect(mockSetUser).not.toBeCalled();
  });

  it('should set user identity when user is authenticated', async () => {
    const event = getTypedEvent({
      locals: getMockWithType<App.Locals>({
        authUser: getMockAuthUser(),
      }),
    });

    await setSentryUserIdentity({ event, resolve: mockHandleResolve });

    expect(mockSetUser).toBeCalledTimes(1);
    expect(mockSetUser).toHaveBeenCalledWith({
      id: 'mock-user-id',
      email: 'mock-email',
    });
    expect(mockHandleResolve).toHaveBeenCalledWith(event);
  });

  it('should set user identity to null when user is not authenticated', async () => {
    const event = getTypedEvent({
      locals: getMockWithType<App.Locals>({
        authUser: null,
      }),
    });

    await setSentryUserIdentity({ event, resolve: mockHandleResolve });

    expect(mockSetUser).toBeCalledTimes(1);
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockHandleResolve).toHaveBeenCalledWith(event);
  });
});

function getTypedEvent(event: any) {
  return getMockWithType<
    RequestEvent<Partial<Record<string, string>>, string | null>
  >(event);
}
