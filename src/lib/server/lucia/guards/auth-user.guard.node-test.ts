import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { guardAuthUser } from './auth-user.guard';
import * as sveltejsKitModule from '@sveltejs/kit';
import { getMockAuthUser } from '$lib/shared/lucia/testing';

describe(guardAuthUser.name, () => {
  let redirectSpy: MockInstance;

  beforeEach(() => {
    redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should return if user is authenticated', async () => {
    const locals = {
      authUser: getMockAuthUser(),
    } as App.Locals;
    const url = new URL('http://localhost');

    const result = guardAuthUser(locals, url);

    expect(result).toEqual({
      authUser: locals.authUser,
    });
    expect(redirectSpy).toHaveBeenCalledTimes(0);
  });

  it('should throw redirect if user is not authenticated', async () => {
    const locals = {} as App.Locals;
    const url = new URL('http://localhost/protected?param=value');
    const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

    expect(() => guardAuthUser(locals, url)).toThrow();

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(
      307,
      '/sign-in?originalPath=%2Fprotected%3Fparam%3Dvalue',
    );
  });
});
