import { describe, expect, it } from 'vitest';

import { expectZodErrorMessages } from '$lib/shared/zod/testing';

import { createEditCodeSnippetFormSchema } from './create-edit-code-snippet.dto';

const formSchema = Object.keys({
  createEditCodeSnippetFormSchema,
})[0]!;

describe(formSchema, () => {
  it('should pass valid object', async () => {
    expect(() =>
      createEditCodeSnippetFormSchema.parse({
        name: 'mock-name',
        code: 'mock-code',
      }),
    ).not.toThrow();
  });

  it('should fail object with empty name and code', async () => {
    expectZodErrorMessages(() => {
      createEditCodeSnippetFormSchema.parse({
        name: '',
        code: '',
      });
    }, ['Code is required', 'Name is required']);
  });

  it('should fail object with missing name and code', async () => {
    expectZodErrorMessages(() => {
      createEditCodeSnippetFormSchema.parse({});
    }, ['Code is required', 'Name is required']);
  });

  it('should fail object with an unknown property', async () => {
    expectZodErrorMessages(() => {
      createEditCodeSnippetFormSchema.parse({
        name: 'mock-name',
        code: 'mock-code',
        unknownProperty: 'unknown-property',
      });
    }, ["Unrecognized key(s) in object: 'unknownProperty'"]);
  });
});
