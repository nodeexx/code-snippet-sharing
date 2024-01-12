import { describe, it, expect, vi } from 'vitest';
import { throwCodeSnippetNotFoundError } from './errors';
import * as sveltejsKitModule from '@sveltejs/kit';

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
