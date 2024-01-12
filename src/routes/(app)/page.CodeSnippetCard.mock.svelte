<script lang="ts">
import { ignoreUnusedExportLetLintErrors } from '$lib/client/core/utils';
import type { GlobalMessage } from '$lib/client/global-messages/types';
import type { DeleteCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';
import type { AuthUser } from '$lib/shared/lucia/types';
import type { CodeSnippet } from '@prisma/client';
import type { SuperForm } from 'sveltekit-superforms/client';

export let codeSnippet: CodeSnippet;
export let codeSnippetDeletionSuperForm: SuperForm<
  DeleteCodeSnippetFormSchema,
  GlobalMessage
>;
export let authUser: AuthUser | null;

ignoreUnusedExportLetLintErrors(
  codeSnippet,
  codeSnippetDeletionSuperForm,
  authUser,
);
</script>

<div>mock-code-snippet-card</div>
