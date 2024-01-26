import { getMockAuthSession } from '$lib/shared/lucia/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+layout.server';
import type { LayoutServerLoadEvent } from './$types';
import { auth } from '$lib/server/lucia';
import type { Cookies } from '@sveltejs/kit';

describe(load.name, () => {
  beforeEach(async () => {
    vi.spyOn(auth, 'invalidateSession').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should return authUser when user is authenticated', async () => {
    const mockAuthSession = getMockAuthSession();
    const mockLocals = {
      authUser: mockAuthSession.user,
    } as App.Locals;
    const mockCookies = {
      get: vi.fn(),
    } as Partial<Cookies>;
    const mockServerLoadEvent = {
      locals: mockLocals,
      cookies: mockCookies,
    } as LayoutServerLoadEvent;

    const result = await load(mockServerLoadEvent);

    expect(result).toEqual({
      authUser: mockAuthSession.user,
      posthog: {
        apiHost: undefined,
        projectApiKey: undefined,
      },
    });
    expect(mockCookies.get).toHaveBeenCalledTimes(1);
    expect(mockCookies.get).toHaveBeenCalledWith('flash');
  });

  it('should return null when user is not authenticated', async () => {
    const mockLocals = {
      authUser: null,
    } as App.Locals;
    const mockCookies = {
      get: vi.fn(),
    } as Partial<Cookies>;
    const mockServerLoadEvent = {
      locals: mockLocals,
      cookies: mockCookies,
    } as LayoutServerLoadEvent;

    const result = await load(mockServerLoadEvent);

    expect(result).toEqual({
      authUser: null,
      posthog: {
        apiHost: undefined,
        projectApiKey: undefined,
      },
    });
    expect(mockCookies.get).toHaveBeenCalledTimes(1);
    expect(mockCookies.get).toHaveBeenCalledWith('flash');
  });
});
