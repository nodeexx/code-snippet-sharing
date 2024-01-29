<script lang="ts">
import { Card } from '$lib/client/components/common';
import { CodeSnippetCreateEditForm } from '$lib/client/components/code-snippets';
import { goBack } from '$lib/client/core/utils';
import { config } from '$lib/client/core/config';
import { onMount } from 'svelte';
import { previousAppPage } from '$lib/client/core/stores';

export let data;

onMount(() => {
  // Navigation to page happens after its `onMount`
  const unsubscribePreviousAppPage = previousAppPage.subscribe(() => {});

  return () => {
    unsubscribePreviousAppPage();
  };
});
</script>

<svelte:head>
  <title>Edit - {data.form.data.name}{config.pageTitleSuffix}</title>
  <meta
    name="description"
    content="Edit code snippet page - {data.form.data.name}"
  />
</svelte:head>

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
