<script lang="ts">
import IconArrowLeft from '~icons/fa6-solid/arrow-left';
import IconArrowRight from '~icons/fa6-solid/arrow-right';

export let previousPageUrlPath: string | undefined = undefined;
export let nextPageUrlPath: string | undefined = undefined;
</script>

{#if previousPageUrlPath || nextPageUrlPath}
  <div class="flex gap-4" data-testid="simple-paginator">
    {#if previousPageUrlPath}
      <a href="{previousPageUrlPath}" aria-label="Previous page">
        <button
          type="button"
          class="variant-filled btn-icon"
          aria-label="Go to the previous page"
          data-testid="previous-button"
        >
          <IconArrowLeft />
        </button>
      </a>
    {/if}
    {#if nextPageUrlPath}
      <a href="{nextPageUrlPath}" aria-label="Next page">
        <button
          type="button"
          class="variant-filled btn-icon"
          aria-label="Go to the next page"
          data-testid="next-button"
        >
          <IconArrowRight />
        </button>
      </a>
    {/if}
  </div>
{/if}
