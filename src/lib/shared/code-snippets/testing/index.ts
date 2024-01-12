import type { CodeSnippet } from '@prisma/client';
import type { SuperValidated } from 'sveltekit-superforms';
import type { CreateEditCodeSnippetFormSchema } from '../dtos';

export function getMockCodeSnippet(
  overrides?: Partial<CodeSnippet>,
): CodeSnippet {
  return {
    id: 1,
    user_id: 'mock-user-id',
    name: 'mock-name',
    code: 'mock-code',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides,
  };
}

export function getMockCreateCodeSnippetFormConstraints(): Partial<
  SuperValidated<CreateEditCodeSnippetFormSchema, App.Superforms.Message>
> {
  return {
    constraints: {
      code: {
        minlength: 1,
        required: true,
      },
      name: {
        minlength: 1,
        required: true,
      },
    },
  };
}
