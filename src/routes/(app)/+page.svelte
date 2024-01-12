<script lang="ts">
import { goto, invalidateAll } from '$app/navigation';
import { CodeSnippetCard } from '$lib/client/components/code-snippets';
import CodeSnippetFindForm from '$lib/client/components/code-snippets/CodeSnippetFindForm.svelte';
import { Alert, Card } from '$lib/client/components/common';
import SimplePaginator from '$lib/client/components/common/SimplePaginator.svelte';
import {
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '$lib/client/global-messages/utils';
import type { FindCodeSnippetsQuery } from '$lib/shared/code-snippets/dtos';
import { getToastStore } from '@skeletonlabs/skeleton';
import { superForm } from 'sveltekit-superforms/client';
import IconPlus from '~icons/fa6-solid/plus';

export let data;

const toastStore = getToastStore();
const codeSnippetDeletionSuperForm = superForm(data.deleteForm, {
  onUpdated({ form }) {
    showToastIfFormMessagePresent(toastStore, form);
  },
  onError({ result }) {
    showToastOnInternetDisconnect(toastStore, result);
  },
  warnings: {
    // NOTE: All delete forms on this page have the same id
    // and we are ok with that - everything will work as expected
    duplicateId: false,
  },
});

const { message } = codeSnippetDeletionSuperForm;

$: query = data.query as FindCodeSnippetsQuery;

/**
 * goto instead of form submit to avoid page reload
 */
async function changeUrl() {
  const form = document.getElementById('find-form') as HTMLFormElement;
  const formData = new FormData(form);
  const searchParams = new URLSearchParams();
  formData.forEach((value, key) => {
    searchParams.append(key, String(value));
  });

  const newUrl = new URL(window.location.href);
  newUrl.search = searchParams.toString();

  await goto(newUrl);
}

async function reloadData() {
  await invalidateAll();
}
</script>

<div class="flex h-full flex-col items-center justify-center gap-5">
  <a href="/code-snippets/create">
    <button
      type="button"
      class="variant-filled-primary btn"
      data-testid="create-button"
    >
      <span>
        <IconPlus />
      </span>
      <span>New code snippet</span>
    </button>
  </a>

  <Card
    class="flex h-full flex-col"
    slotHeader="flex items-center justify-start"
    slotBody="h-full flex-1 flex flex-col gap-4"
    slotFooter="flex items-center justify-end"
  >
    <svelte:fragment slot="header">
      <CodeSnippetFindForm
        actionPath="/"
        authUser="{data.authUser}"
        {changeUrl}
        {reloadData}
        bind:query
      />
    </svelte:fragment>

    {#if $message}
      <noscript class="w-full">
        <Alert type="{$message.type}" message="{$message.message}" />
      </noscript>
    {/if}

    {#if data.codeSnippets.length}
      {#each data.codeSnippets as codeSnippet (codeSnippet.id)}
        <CodeSnippetCard
          {codeSnippet}
          {codeSnippetDeletionSuperForm}
          authUser="{data.authUser}"
        />
      {/each}
    {:else}
      <p>No code snippets found</p>
    {/if}

    <svelte:fragment slot="footer">
      <SimplePaginator
        previousPageUrlPath="{data.previousPageUrlPath}"
        nextPageUrlPath="{data.nextPageUrlPath}"
      />
    </svelte:fragment>
  </Card>
</div>
