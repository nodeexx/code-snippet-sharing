import * as sveltejsKitModule from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as libServerCoreConfigModule from '$lib/server/core/config';
import { ORIGINAL_PATH_URL_QUERY_PARAM_NAME } from '$lib/shared/core/utils';

import { load } from './+page.server';
import type { PageServerLoadEvent } from './$types';

describe(load.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should throw 503 error if maintenance mode is enabled', async () => {
    vi.spyOn(libServerCoreConfigModule, 'config', 'get').mockReturnValueOnce({
      isMaintenanceMode: true,
    } as any);
    const errorSpy = vi.spyOn(sveltejsKitModule, 'error');

    const setHeaders = vi.fn();
    const event = {
      url: new URL('http://localhost/maintenance'),
      setHeaders,
    } as Partial<PageServerLoadEvent> as PageServerLoadEvent;
    expect(() => load(event)).toThrow();

    expect(setHeaders).toHaveBeenCalledTimes(1);
    expect(setHeaders).toHaveBeenCalledWith({
      'Retry-After': '600',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(503);
  });

  it('should redirect to original path if query param is present', async () => {
    vi.spyOn(libServerCoreConfigModule, 'config', 'get').mockReturnValueOnce({
      isMaintenanceMode: false,
    } as any);
    const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

    const setHeaders = vi.fn();
    const event = {
      url: new URL(
        `http://localhost/maintenance?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=%2Fauth`,
      ),
      setHeaders,
    } as Partial<PageServerLoadEvent> as PageServerLoadEvent;
    expect(() => load(event)).toThrow();

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(307, '/auth');
  });

  it('should redirect to root route', async () => {
    vi.spyOn(libServerCoreConfigModule, 'config', 'get').mockReturnValueOnce({
      isMaintenanceMode: false,
    } as any);
    const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');

    const setHeaders = vi.fn();
    const event = {
      url: new URL('http://localhost/maintenance'),
      setHeaders,
    } as Partial<PageServerLoadEvent> as PageServerLoadEvent;
    expect(() => load(event)).toThrow();

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(307, '/');
  });
});
