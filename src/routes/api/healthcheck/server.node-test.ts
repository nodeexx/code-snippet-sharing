import { afterEach, describe, expect, it, vi } from 'vitest';

import * as libServerCoreConfigModule from '$lib/server/core/config';

import { GET } from './+server';

describe(GET.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('should return OK status', async () => {
    vi.spyOn(libServerCoreConfigModule, 'config', 'get').mockReturnValue({
      isMaintenanceMode: false,
    } as Partial<
      typeof libServerCoreConfigModule.config
    > as typeof libServerCoreConfigModule.config);

    const response = GET();

    expect(await response.json()).toEqual({
      status: 'OK',
    });
  });

  it('should return maintenance status', async () => {
    vi.spyOn(libServerCoreConfigModule, 'config', 'get').mockReturnValue({
      isMaintenanceMode: true,
    } as Partial<
      typeof libServerCoreConfigModule.config
    > as typeof libServerCoreConfigModule.config);

    const response = GET();

    expect(await response.json()).toEqual({
      status: 'maintenance',
    });
  });
});
