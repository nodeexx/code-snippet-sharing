import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './+server';
import * as libServerConfigModule from '$lib/server/core/config';

describe(GET.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should return OK status', async () => {
    vi.spyOn(libServerConfigModule, 'config', 'get').mockReturnValue({
      isMaintenanceMode: false,
    } as Partial<
      typeof libServerConfigModule.config
    > as typeof libServerConfigModule.config);

    const response = await GET();

    expect(await response.json()).toEqual({
      status: 'OK',
    });
  });

  it('should return maintenance status', async () => {
    vi.spyOn(libServerConfigModule, 'config', 'get').mockReturnValue({
      isMaintenanceMode: true,
    } as Partial<
      typeof libServerConfigModule.config
    > as typeof libServerConfigModule.config);

    const response = await GET();

    expect(await response.json()).toEqual({
      status: 'maintenance',
    });
  });
});
