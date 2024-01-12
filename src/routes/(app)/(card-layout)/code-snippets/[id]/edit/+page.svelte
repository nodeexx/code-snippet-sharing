<script lang="ts">
import { Card } from '$lib/client/components/common';
import { CodeSnippetCreateEditForm } from '$lib/client/components/code-snippets';
import { goBack } from '$lib/client/core/utils';

export let data;
</script>

<Card
  class="flex h-full flex-col"
  slotBody="flex-1"
  slotFooter="flex items-center justify-center gap-4"
>
  <CodeSnippetCreateEditForm
    form="{data.form}"
    type="edit"
    id="code-snippet-form"
  />
  <svelte:fragment slot="footer">
    <button form="code-snippet-form" class="variant-filled-primary btn">
      <span>Confirm</span>
    </button>
    <button type="button" class="variant-filled btn" on:click="{goBack}">
      <span>Cancel</span>
    </button>
  </svelte:fragment>
</Card>
