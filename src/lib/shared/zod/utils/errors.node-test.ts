import { describe, expect, it } from 'vitest';

import { getRequiredErrorMessage } from './errors';

describe(getRequiredErrorMessage.name, () => {
  it('should return an error message', async () => {
    expect(getRequiredErrorMessage('mock-field-name')).toEqual(
      'mock-field-name is required',
    );
  });
});
