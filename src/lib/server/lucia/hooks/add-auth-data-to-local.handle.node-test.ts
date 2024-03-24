import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as clientModule from '../client';
import type * as utilsModule from '../utils';
import { addAuthDataToLocalHandle } from './add-auth-data-to-local.handle';

vi.mock('../client', async () => {
  const actual = (await vi.importActual('../client')) as typeof clientModule;
  return {
    ...actual,
    auth: {
      handleRequest: vi.fn().mockReturnValue('mock-auth-request'),
    },
  };
});

vi.mock('../utils', async () => {
  const actual = (await vi.importActual('../utils')) as typeof utilsModule;
  return {
    ...actual,
    getCurrentAuthSession: vi.fn().mockReturnValue('mock-auth-session'),
    getCurrentAuthUserFromSession: vi.fn().mockReturnValue('mock-auth-user'),
  };
});

describe(addAuthDataToLocalHandle.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should set event.locals', async () => {
    const resolve = vi.fn();
    const event = {
      locals: {},
    };
    await addAuthDataToLocalHandle({
      event: event as any,
      resolve,
    });

    expect(event.locals).toEqual({
      authRequest: 'mock-auth-request',
      authSession: 'mock-auth-session',
      authUser: 'mock-auth-user',
    });
    expect(resolve).toHaveBeenCalledTimes(1);
  });
});
