import { describe, expect, it } from 'vitest';

import { formatUtcDateTime } from './datetime.utils';

describe(formatUtcDateTime.name, () => {
  it('should format UTC date time', async () => {
    const date = new Date('2021-01-01T01:00:00+01:00');

    expect(formatUtcDateTime(date)).toEqual('2021-01-01T00:00Z');
  });
});
