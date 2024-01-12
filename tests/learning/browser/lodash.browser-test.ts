import partition from 'lodash/partition';
import { describe, it, expect } from 'vitest';

/**
 * Currently fails because of the following error:
 * "TypeError: __vi_esm_0__.default is not a function or its return value is not iterable"
 * https://github.com/vitest-dev/vitest/issues/4097
 */
describe('lodash', () => {
  describe('partition', () => {
    it('should partition array', () => {
      const [odd, even] = partition([1, 2, 3, 4], (n) => n % 2);

      expect(odd).toEqual([1, 3]);
      expect(even).toEqual([2, 4]);
    });
  });
});
