<script lang="ts">
import '../app.postcss';

import { Toast } from '@skeletonlabs/skeleton';
import { getToastStore } from '@skeletonlabs/skeleton';
import { onDestroy, onMount } from 'svelte';
import { getFlash } from 'sveltekit-flash-message';

import { page } from '$app/stores';
import { PageMessage } from '$lib/client/components/app-shell';
import { createFlashToastSubscriber } from '$lib/client/global-messages/utils';
import {
  posthog,
  posthogDefaultPageEventsCaptureConfigurator,
  posthogUserIdentityConfigurator,
} from '$lib/client/posthog';
import { sentryUserIdentityConfigurator } from '$lib/client/sentry';
import {
  setupSkeletonModalToastDrawer,
  setupSkeletonPopup,
} from '$lib/client/skeleton/utils';
import { sentry } from '$lib/shared/sentry';

setupSkeletonPopup();
setupSkeletonModalToastDrawer();

const toastStore = getToastStore();
// NOTE: Is undefined if flash message is not present (flash cookie not set)
const flash = getFlash(page);

flash.subscribe(createFlashToastSubscriber(toastStore));

onMount(() => {
  if (sentry) {
    sentryUserIdentityConfigurator.configure();
  }

  if (posthog) {
    posthogUserIdentityConfigurator.configure();
    posthogDefaultPageEventsCaptureConfigurator.configure();
  }
});

onDestroy(() => {
  if (posthogDefaultPageEventsCaptureConfigurator.isConfigured) {
    posthogDefaultPageEventsCaptureConfigurator.cleanup();
  }

  if (posthogUserIdentityConfigurator.isConfigured) {
    posthogUserIdentityConfigurator.cleanup();
  }

  if (sentryUserIdentityConfigurator.isConfigured) {
    sentryUserIdentityConfigurator.cleanup();
  }
});
</script>

<Toast position="br" />

{#if $flash}
  <noscript class="w-full">
    <PageMessage message="{$flash.message}" type="{$flash.type}" />
  </noscript>
{/if}

<slot />
