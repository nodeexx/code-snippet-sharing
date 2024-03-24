import { z } from 'zod';

import { getRequiredErrorMessage } from '$lib/shared/zod/utils';

export const deleteCodeSnippetFormSchema = z
  .object({
    id: z.number({ required_error: getRequiredErrorMessage('ID') }),
  })
  .strict();
export type DeleteCodeSnippetFormSchema = typeof deleteCodeSnippetFormSchema;
