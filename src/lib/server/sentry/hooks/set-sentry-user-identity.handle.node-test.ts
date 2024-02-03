import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
  type Mock,
} from 'vitest';
import { setSentryUserIdentity } from './set-sentry-user-identity.handle';
import * as sentrySveltekitModule from '@sentry/sveltekit';
import { getMockAuthUser } from '$lib/shared/lucia/testing';
import type { RequestEvent } from '@sveltejs/kit';
import { getMockWithType } from '$lib/shared/core/testing';

vi.mock('@sentry/sveltekit');

describe(setSentryUserIdentity.name, () => {
  let setUserSpy: MockInstance<any[], void>;
  let mockHandleResolve: Mock<any[], any>;

  beforeEach(() => {
    mockHandleResolve = vi.fn();
    setUserSpy = vi.spyOn(sentrySveltekitModule, 'setUser').mockReturnValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set user identity when user is authenticated', async () => {
    const event = getTypedEvent({
      locals: getMockWithType<App.Locals>({
        authUser: getMockAuthUser(),
      }),
    });

    await setSentryUserIdentity({ event, resolve: mockHandleResolve });

    expect(setUserSpy).toBeCalledTimes(1);
    expect(setUserSpy).toHaveBeenCalledWith({
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

    expect(setUserSpy).toBeCalledTimes(1);
    expect(setUserSpy).toHaveBeenCalledWith(null);
    expect(mockHandleResolve).toHaveBeenCalledWith(event);
  });
});

function getTypedEvent(event: any) {
  return getMockWithType<
    RequestEvent<Partial<Record<string, string>>, string | null>
  >(event);
}
