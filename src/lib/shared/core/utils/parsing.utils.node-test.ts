import { describe, expect, it } from 'vitest';

import {
  attemptToParseAsNumber,
  isStringParsableAsNumber,
} from './parsing.utils';

describe(isStringParsableAsNumber.name, () => {
  it('should return true', async () => {
    expect(isStringParsableAsNumber('42')).toEqual(true);
  });

  it('should return false', async () => {
    expect(isStringParsableAsNumber('42a')).toEqual(false);
  });
});

describe(attemptToParseAsNumber.name, () => {
  it('should return a number', async () => {
    expect(attemptToParseAsNumber('42')).toEqual(42);
  });

  it('should return undefined for invalid string', async () => {
    expect(attemptToParseAsNumber('42a')).toEqual(undefined);
  });

  it('should return undefined for null', async () => {
    expect(attemptToParseAsNumber(null)).toEqual(undefined);
  });
});
