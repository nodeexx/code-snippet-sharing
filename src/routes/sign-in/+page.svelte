<script lang="ts">
import { AppShell } from '$lib/client/components/app-shell';
import {
  Alert,
  Card,
  SingleCardPageContainer,
} from '$lib/client/components/common';
import IconGoogle from '~icons/fa6-brands/google';
import { getToastStore } from '@skeletonlabs/skeleton';
import { superForm } from 'sveltekit-superforms/client';
import {
  showToastIfFormMessagePresent,
  showToastOnInternetDisconnect,
} from '$lib/client/global-messages/utils';
import { config } from '$lib/client/core/config';

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
</script>

<svelte:head>
  <title>Sign in{config.pageTitleSuffix}</title>
</svelte:head>

<AppShell appBar="{false}">
  <SingleCardPageContainer>
    <Card>
      <svelte:fragment slot="header">
        <h1 class="h2 text-center">Sign in</h1>
      </svelte:fragment>

      <div class="flex flex-col items-center gap-4">
        <form method="post" action="?/google-auth" use:enhance>
          <button class="variant-filled-surface btn">
            <span>
              <IconGoogle />
            </span>
            <span>Sign in with Google</span>
          </button>
        </form>

        {#if $message}
          <noscript class="w-full">
            <Alert type="{$message.type}" message="{$message.message}" />
          </noscript>
        {/if}
      </div>
    </Card>
  </SingleCardPageContainer>
</AppShell>
