import { describe, it, expect } from 'vitest';
import {
  findCodeSnippetsDto,
  type FindCodeSnippetsQuery,
} from './find-code-snippets.dto';
import { expectZodErrorMessages } from '$lib/shared/zod/testing';

const formSchema = Object.keys({
  findCodeSnippetsDto,
})[0]!;

describe(formSchema, () => {
  it('should pass valid object with minimum required properties', async () => {
    expect(() =>
      findCodeSnippetsDto.parse({ count: 10 } as FindCodeSnippetsQuery),
    ).not.toThrow();
  });

  it('should pass valid object with all properties', async () => {
    expect(() =>
      findCodeSnippetsDto.parse({
        page: 1,
        count: 10,
      } as FindCodeSnippetsQuery),
    ).not.toThrow();
  });

  it('should fail object with wrong property values', async () => {
    expectZodErrorMessages(() => {
      findCodeSnippetsDto.parse({
        page: 0,
        count: -1,
      });
    }, ['Count must be >= 0', 'Page number must be > 0']);
  });

  it('should fail object if count is 0 and page is greater than 1', async () => {
    expectZodErrorMessages(() => {
      findCodeSnippetsDto.parse({
        page: 2,
        count: 0,
      } as FindCodeSnippetsQuery);
    }, ['Count cannot be 0 if page is greater than 1']);
  });
});
