<script lang="ts">
import { Card } from '$lib/client/components/common';
import { formatUtcDateTime } from '$lib/shared/core/utils';
import type { CodeSnippet } from '@prisma/client';
import IconPenToSquare from '~icons/fa6-solid/pen-to-square';
import IconTrash from '~icons/fa6-solid/trash';
import type { GlobalMessage } from '$lib/client/global-messages/types';
import type { SuperForm } from 'sveltekit-superforms/client';
import type { AuthUser } from '$lib/shared/lucia/types';
import type { DeleteCodeSnippetFormSchema } from '$lib/shared/code-snippets/dtos';

export let codeSnippet: CodeSnippet;
export let codeSnippetDeletionSuperForm: SuperForm<
  DeleteCodeSnippetFormSchema,
  GlobalMessage
>;
export let authUser: AuthUser | null;

const { enhance } = codeSnippetDeletionSuperForm;
</script>

<Card
  class="card-hover flex flex-col"
  slotBody="bg-surface-700 rounded-container-token flex"
>
  <a href="/code-snippets/{codeSnippet.id}" class="w-full">
    <div class="flex h-full flex-1 flex-col gap-2">
      <p class="font-bold">
        {formatUtcDateTime(codeSnippet.created_at)}
      </p>
      <p>{codeSnippet.name}</p>
    </div>
  </a>

  {#if authUser?.userId === codeSnippet.user_id}
    <div class="flex h-full flex-row items-center justify-center gap-2">
      <a href="/code-snippets/{codeSnippet.id}/edit">
        <button
          type="button"
          class="variant-filled btn-icon"
          data-testid="edit-button-{codeSnippet.id}"
          aria-label="Edit code snippet"
        >
          <IconPenToSquare />
        </button>
      </a>
      <form method="post" action="?/delete" use:enhance>
        <input type="hidden" name="id" value="{codeSnippet.id}" />
        <button
          class="variant-filled btn-icon"
          data-testid="delete-button-{codeSnippet.id}"
          aria-label="Delete code snippet"
          on:click|stopPropagation
        >
          <IconTrash />
        </button>
      </form>
    </div>
  {/if}
</Card>
