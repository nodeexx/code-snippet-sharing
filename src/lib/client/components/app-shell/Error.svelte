<script lang="ts">
import { invalidateAll } from '$app/navigation';
import { AppShell } from '$lib/client/components/app-shell';
import { onMount } from 'svelte';

export let showAppBar = true;
export let title = 'Error';
export let message = 'Unknown error';

onMount(async () => {
  if (showAppBar) {
    // NOTE: Needed to invalidate the layout's page data cache and rerun its load
    // function, so that the AppBar has access to fresh auth data.
    await invalidateAll();
  }
});
</script>

<AppShell appBar="{showAppBar}">
  <div class="flex h-full flex-col items-center justify-center gap-8">
    <h1 class="h1">{title}</h1>
    <p>{message}</p>
  </div>
</AppShell>
