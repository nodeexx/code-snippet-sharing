<script lang="ts">
import { getToastStore } from '@skeletonlabs/skeleton';
import { superForm } from 'sveltekit-superforms/client';

import { Alert, Card } from '$lib/client/components/common';
import { config } from '$lib/client/core/config';
import {
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '$lib/client/global-messages/utils';

export let data;

const toastStore = getToastStore();

const { message, enhance } = superForm(data.form, {
  onUpdated({ form }) {
    showToastIfFormMessagePresent(toastStore, form);
  },
  onError({ result }) {
    showToastOnInternetDisconnect(toastStore, result);
  },
});

function signOut() {
  const form = document.getElementById('sign-out-form') as HTMLFormElement;
  const button = document.getElementById(
    'sign-out-button',
  ) as HTMLButtonElement;
  form.requestSubmit(button);
}
</script>

<svelte:head>
  <title>Profile{config.pageTitleSuffix}</title>
  <meta name="description" content="Profile page" />
</svelte:head>

<Card>
  <svelte:fragment slot="header">
    <h1 class="h2 text-center">Profile</h1>
  </svelte:fragment>

  <div class="flex flex-col items-center gap-4">
    <p>{data.authUser?.email}</p>
    <form id="sign-out-form" method="post" action="?/sign-out" use:enhance>
      <button
        id="sign-out-button"
        class="variant-filled-primary btn"
        on:click|preventDefault="{signOut}"
      >
        <span>Sign out</span>
      </button>
    </form>

    {#if $message}
      <noscript class="w-full">
        <Alert type="{$message.type}" message="{$message.message}" />
      </noscript>
    {/if}
  </div>
</Card>
