import { describe, expect, it, vi, afterEach } from 'vitest';
import * as libServerConfigModule from '$lib/server/core/config';
import { maintenanceModeHandle } from './maintenance-mode.handle';
import * as sveltejsKitModule from '@sveltejs/kit';

describe(maintenanceModeHandle.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should resolve if not in maintenance mode', async () => {
    const spy = vi
      .spyOn(libServerConfigModule, 'config', 'get')
      .mockReturnValueOnce({
        isMaintenanceMode: false,
      } as any);
    const resolve = vi.fn();
    await maintenanceModeHandle({
      event: {
        request: {
          url: 'http://localhost',
        },
      } as any,
      resolve,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it('should resolve if requesting maintenance route', async () => {
    const spy = vi
      .spyOn(libServerConfigModule, 'config', 'get')
      .mockReturnValueOnce({
        isMaintenanceMode: true,
      } as any);
    const resolve = vi.fn();
    await maintenanceModeHandle({
      event: {
        request: {
          url: 'http://localhost/maintenance',
        },
      } as any,
      resolve,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it('should throw redirect', async () => {
    const configSpy = vi
      .spyOn(libServerConfigModule, 'config', 'get')
      .mockReturnValueOnce({
        isMaintenanceMode: true,
      } as any);
    const redirectSpy = vi.spyOn(sveltejsKitModule, 'redirect');
    const resolve = vi.fn();
    await expect(
      maintenanceModeHandle({
        event: {
          request: {
            url: 'http://localhost',
          },
        } as any,
        resolve,
      }),
    ).rejects.toThrow();

    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(
      307,
      '/maintenance?originalPath=%2F',
    );
    expect(resolve).toHaveBeenCalledTimes(0);
  });
});
