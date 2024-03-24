import { describe, expect, it } from 'vitest';

import { expectZodErrorMessages } from '$lib/shared/zod/testing';

import { deleteCodeSnippetFormSchema } from './delete-code-snippet.dto';

const formSchema = Object.keys({
  deleteCodeSnippetFormSchema,
})[0]!;

describe(formSchema, () => {
  it('should pass valid object', async () => {
    expect(() =>
      deleteCodeSnippetFormSchema.parse({
        id: 1,
      }),
    ).not.toThrow();
  });

  it('should fail object with missing name and code', async () => {
    expectZodErrorMessages(() => {
      deleteCodeSnippetFormSchema.parse({});
    }, ['ID is required']);
  });

  it('should fail object with an unknown property', async () => {
    expectZodErrorMessages(() => {
      deleteCodeSnippetFormSchema.parse({
        id: 1,
        unknownProperty: 'unknown-property',
      });
    }, ["Unrecognized key(s) in object: 'unknownProperty'"]);
  });
});
