import { describe, expect, it, vi, afterEach } from 'vitest';
import * as utilsModule from '../utils';
import { checkMandatoryPrivateEnvVarsHandle } from './check-mandatory-private-env-vars.handle';

describe(checkMandatoryPrivateEnvVarsHandle.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve', async () => {
    const spy = vi
      .spyOn(utilsModule, 'exitIfEnvVarsNotSet')
      .mockReturnValueOnce();
    const resolve = vi.fn();
    await checkMandatoryPrivateEnvVarsHandle({
      event: {} as any,
      resolve,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it('should reject', async () => {
    const spy = vi
      .spyOn(utilsModule, 'exitIfEnvVarsNotSet')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const resolve = vi.fn();

    await expect(
      checkMandatoryPrivateEnvVarsHandle({
        event: {} as any,
        resolve,
      }),
    ).rejects.toThrow(new Error());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(0);
  });
});
