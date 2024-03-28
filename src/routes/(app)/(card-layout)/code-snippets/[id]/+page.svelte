<script lang="ts">
import { CodeBlock, getToastStore } from '@skeletonlabs/skeleton';
import { superForm } from 'sveltekit-superforms/client';

import IconPenToSquare from '~icons/fa6-solid/pen-to-square';
import IconTrash from '~icons/fa6-solid/trash';
import { page } from '$app/stores';
import { Alert, Card } from '$lib/client/components/common';
import { config } from '$lib/client/core/config';
import {
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '$lib/client/global-messages/utils';
import { formatUtcDateTime } from '$lib/shared/core/utils';

export let data;

const pageJsonLdData = {
  '@context': 'http://schema.org',
  '@type': 'SoftwareSourceCode',
  identifier: data.codeSnippet.id,
  name: data.codeSnippet.name,
  text: data.codeSnippet.code,
  url: $page.url.href,
};
const tagName = 'script';
const pageJsonLdScriptHtml = `<${tagName} type="application/ld+json">${JSON.stringify(
  pageJsonLdData,
)}</${tagName}>`;
const toastStore = getToastStore();
const { message, enhance } = superForm(data.form, {
  onUpdated({ form }) {
    showToastIfFormMessagePresent(toastStore, form);
  },
  onError({ result }) {
    showToastOnInternetDisconnect(toastStore, result);
  },
});
const {
  codeSnippet: { created_at, updated_at },
} = data;
const creationDate = formatUtcDateTime(created_at);
const lastModificationDate = formatUtcDateTime(updated_at);
</script>

<svelte:head>
  <title>{data.codeSnippet.name}{config.pageTitleSuffix}</title>
  <meta
    name="description"
    content="Code snippet - {data.codeSnippet.name} | {data.codeSnippet.code}"
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html pageJsonLdScriptHtml}
</svelte:head>

<Card
  class="flex h-full flex-col"
  slotBody="h-full flex-1 flex flex-col gap-4"
  slotFooter="flex items-center justify-center gap-4"
>
  <svelte:fragment slot="header">
    <h1 class="h2">{data.codeSnippet.name}</h1>
  </svelte:fragment>

  <div class="flex flex-col gap-4 sm:flex-row">
    <div class="flex flex-1 flex-col items-center justify-center">
      <p>Creation date</p>
      <p class="font-bold">{creationDate}</p>
    </div>
    <div class="flex flex-1 flex-col items-center justify-center">
      <p>Last modification date</p>
      <p class="font-bold">{lastModificationDate}</p>
    </div>
  </div>

  <CodeBlock class="flex-1" code="{data.codeSnippet.code}"></CodeBlock>

  {#if $message}
    <noscript class="w-full">
      <Alert type="{$message.type}" message="{$message.message}" />
    </noscript>
  {/if}

  <svelte:fragment slot="footer">
    {#if data.isCodeSnippetAuthor}
      <a href="/code-snippets/{data.codeSnippet.id}/edit">
        <button
          type="button"
          class="variant-filled btn"
          data-testid="edit-button"
        >
          <span>
            <IconPenToSquare />
          </span>
          <span>Edit</span>
        </button>
      </a>
      <form method="post" action="?/delete" use:enhance>
        <button class="variant-filled btn" data-testid="delete-button">
          <span>
            <IconTrash />
          </span>
          <span>Delete</span>
        </button>
      </form>
    {/if}
  </svelte:fragment>
</Card>
