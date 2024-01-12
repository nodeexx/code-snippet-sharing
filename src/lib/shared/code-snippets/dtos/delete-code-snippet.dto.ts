import { getRequiredErrorMessage } from '$lib/shared/zod/utils';
import { z } from 'zod';

export const deleteCodeSnippetFormSchema = z
  .object({
    id: z.number({ required_error: getRequiredErrorMessage('ID') }),
  })
  .strict();
export type DeleteCodeSnippetFormSchema = typeof deleteCodeSnippetFormSchema;
