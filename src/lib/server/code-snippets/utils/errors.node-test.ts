import * as sveltejsKitModule from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';

import { throwCodeSnippetNotFoundError } from './errors';

describe(throwCodeSnippetNotFoundError.name, () => {
  it('should throw a 404 error', () => {
    const errorSpy = vi.spyOn(sveltejsKitModule, 'error');

    const mockNonExistingCodeSnippetId = 1;
    expect(() =>
      throwCodeSnippetNotFoundError(mockNonExistingCodeSnippetId),
    ).toThrow();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      404,
      'Code snippet with ID 1 not found',
    );
  });
});
