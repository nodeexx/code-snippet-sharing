<script lang="ts">
import { AppBar } from '@skeletonlabs/skeleton';

import IconHouse from '~icons/fa6-solid/house';
import { AppMenuButton } from '$lib/client/components/app-shell';
</script>

<AppBar>
  <svelte:fragment slot="lead">
    <a href="/" aria-label="Home page">
      <button
        type="button"
        class="variant-filled-surface btn-icon"
        aria-label="Go to home page"
      >
        <IconHouse />
      </button>
    </a>
  </svelte:fragment>

  <svelte:fragment slot="trail">
    <AppMenuButton />
  </svelte:fragment>
</AppBar>
