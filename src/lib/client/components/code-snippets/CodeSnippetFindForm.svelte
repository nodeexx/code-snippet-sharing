<script lang="ts">
import type { FindCodeSnippetsQuery } from '$lib/shared/code-snippets/dtos';
import type { AuthUser } from '$lib/shared/lucia/types';
import { onMount } from 'svelte';
import IconRotateRight from '~icons/fa6-solid/rotate-right';

export let actionPath: string;
export let query: FindCodeSnippetsQuery;
export let authUser: AuthUser | null;
export let changeUrl: () => void | Promise<void>;
export let reloadData: () => void | Promise<void>;

let wasCsrPerformed = false;

onMount(() => {
  wasCsrPerformed = true;
});
</script>

<form
  id="find-form"
  method="GET"
  action="{actionPath}"
  class="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:justify-start"
>
  {#if query.page}
    <input
      type="hidden"
      name="page"
      value="{query.page}"
      data-testid="page-input"
    />
  {/if}

  {#if query.count}
    <input
      type="hidden"
      name="count"
      value="{query.count}"
      data-testid="count-input"
    />
  {/if}

  {#if authUser}
    <label class="label">
      <span class="whitespace-nowrap">Filter by author</span>
      <select
        name="filterBy"
        class="select"
        data-testid="filter-dropdown"
        bind:value="{query.filterBy}"
        on:change="{changeUrl}"
      >
        <option value="" selected="{query.filterBy !== 'author'}">No</option>
        <option value="author" selected="{query.filterBy === 'author'}">
          Yes
        </option>
      </select>
    </label>
  {/if}

  <label class="label">
    <span class="whitespace-nowrap">Sort by creation date</span>
    <select
      name="sortOrder"
      class="select"
      data-testid="sorting-dropdown"
      bind:value="{query.sortOrder}"
      on:change="{changeUrl}"
    >
      <option
        value="asc"
        selected="{!query.sortOrder || query.sortOrder === 'asc'}"
      >
        Ascending
      </option>
      <option value="desc" selected="{query.sortOrder === 'desc'}">
        Descending
      </option>
    </select>
  </label>

  <noscript class="w-full">
    <button
      class="variant-filled-surface btn"
      data-testid="apply-filters-button"
    >
      Apply
    </button>
  </noscript>

  <button
    type="button"
    class="variant-filled-surface btn-icon"
    class:hidden="{!wasCsrPerformed}"
    data-testid="reload-data-button"
    aria-label="Reload data"
    on:click="{reloadData}"
  >
    <IconRotateRight />
  </button>
</form>
