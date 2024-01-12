<script lang="ts">
import '../app.postcss';
import {
  setupSkeletonModalToastDrawer,
  setupSkeletonPopup,
} from '$lib/client/skeleton/utils';
import { Toast } from '@skeletonlabs/skeleton';
import { getFlash } from 'sveltekit-flash-message';
import { page } from '$app/stores';
import { getToastStore } from '@skeletonlabs/skeleton';
import { PageMessage } from '$lib/client/components/app-shell';
import { createFlashToastSubscriber } from '$lib/client/global-messages/utils';

setupSkeletonPopup();
setupSkeletonModalToastDrawer();

const toastStore = getToastStore();
// NOTE: Is undefined if flash message is not present (flash cookie not set)
const flash = getFlash(page);

flash.subscribe(createFlashToastSubscriber(toastStore));
</script>

<Toast position="br" />

{#if $flash}
  <noscript class="w-full">
    <PageMessage message="{$flash.message}" type="{$flash.type}" />
  </noscript>
{/if}

<slot />
