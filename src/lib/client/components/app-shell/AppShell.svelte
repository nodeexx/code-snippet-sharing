<script lang="ts">
import { AppShell } from '@skeletonlabs/skeleton';
import { AppBar } from '$lib/client/components/app-shell';

export let appBar = true;
</script>

<AppShell>
  <svelte:fragment slot="header">
    {#if appBar}
      <AppBar />
    {/if}
  </svelte:fragment>

  <div class="h-full p-4 sm:p-10">
    <slot />
  </div>
</AppShell>
