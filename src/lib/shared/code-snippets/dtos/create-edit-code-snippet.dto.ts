import { getRequiredErrorMessage } from '$lib/shared/zod/utils';
import { z } from 'zod';

const nameErrorMessage = getRequiredErrorMessage('Name');
const codeErrorMessage = getRequiredErrorMessage('Code');
export const createEditCodeSnippetFormSchema = z
  .object({
    name: z
      .string({ required_error: nameErrorMessage })
      .min(1, nameErrorMessage),
    code: z
      .string({ required_error: codeErrorMessage })
      .min(1, codeErrorMessage),
  })
  .strict();
export type CreateEditCodeSnippetFormSchema =
  typeof createEditCodeSnippetFormSchema;
