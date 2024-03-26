<script lang="ts">
import { getToastStore } from '@skeletonlabs/skeleton';
import { superForm } from 'sveltekit-superforms/client';

import IconPlus from '~icons/fa6-solid/plus';
import { goto, invalidateAll } from '$app/navigation';
import { page } from '$app/stores';
import { CodeSnippetCard } from '$lib/client/components/code-snippets';
import CodeSnippetFindForm from '$lib/client/components/code-snippets/CodeSnippetFindForm.svelte';
import { Alert, Card } from '$lib/client/components/common';
import SimplePaginator from '$lib/client/components/common/SimplePaginator.svelte';
import { config } from '$lib/client/core/config';
import {
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '$lib/client/global-messages/utils';
import type { FindCodeSnippetsQuery } from '$lib/shared/code-snippets/dtos';

export let data;

const pageMetaDescription =
  'Explore a simple Pastebin-like CRUD app: A rich, open-source ' +
  'example of a full-stack SvelteKit application designed for ' +
  'developers. Features comprehensive tooling for real-world software ' +
  'development, including CI/CD, testing, and more.';
const pageMetaKeywords = [
  'code snippets',
  'Pastebin',
  'SvelteKit',
  'full-stack development',
  'CRUD app',
  'open source',
  'software development tools',
  'CI/CD',
  'testing',
].join(', ');
const pageRepositoryUrl = 'https://github.com/nodeexx/code-snippet-sharing';
const pageJsonLdData = {
  '@context': 'http://schema.org',
  '@type': 'WebApplication',
  name: config.appName,
  description: pageMetaDescription,
  license: 'https://opensource.org/licenses/MIT',
  url: $page.url.href,
  sourceCode: 'https://github.com/nodeexx/code-snippet-sharing',
  author: {
    '@type': 'Person',
    name: 'Nodeexx',
    url: 'https://github.com/nodeexx',
  },
};
const tagName = 'script';
const pageJsonLdScriptHtml = `<${tagName} type="application/ld+json">${JSON.stringify(
  pageJsonLdData,
)}</${tagName}>`;
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

<svelte:head>
  <title>Home{config.pageTitleSuffix}</title>
  <meta name="description" content="{pageMetaDescription}" />
  <meta name="keywords" content="{pageMetaKeywords}" />
  <meta name="author" content="Nodeexx" />
  <link rel="canonical" href="${$page.url.href}" />
  <link rel="me" href="{pageRepositoryUrl}" title="GitHub Repository" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html pageJsonLdScriptHtml}
</svelte:head>

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
