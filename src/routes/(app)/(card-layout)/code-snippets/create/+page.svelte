<script lang="ts">
import { Card } from '$lib/client/components/common';
import { CodeSnippetCreateEditForm } from '$lib/client/components/code-snippets';
import { config } from '$lib/client/core/config';

export let data;
</script>

<svelte:head>
  <title>Create code snippet{config.pageTitleSuffix}</title>
</svelte:head>

<Card
  class="flex h-full flex-col"
  slotBody="flex-1"
  slotFooter="flex items-center justify-center gap-4"
>
  <CodeSnippetCreateEditForm
    form="{data.form}"
    type="create"
    id="code-snippet-form"
  />
  <svelte:fragment slot="footer">
    <button form="code-snippet-form" class="variant-filled-primary btn">
      <span>Confirm</span>
    </button>
  </svelte:fragment>
</Card>
