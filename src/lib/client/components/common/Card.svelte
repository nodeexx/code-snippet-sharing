<script lang="ts">
import type { CssClasses } from '@skeletonlabs/skeleton';

export let slotHeader: CssClasses = '';
export let slotBody: CssClasses = '';
export let slotFooter: CssClasses = '';

const defaultClasses = {
  base: 'card w-full max-w-[1000px]',
  header: 'card-header empty:hidden',
  body: 'p-4 empty:hidden',
  footer: 'card-footer empty:hidden',
};

$: baseClasses = `${defaultClasses.base} ${$$props['class'] ?? ''}`.trim();
$: headerClasses = `${defaultClasses.header} ${slotHeader}`.trim();
$: bodyClasses = `${defaultClasses.body} ${slotBody}`.trim();
$: footerClasses = `${defaultClasses.footer} ${slotFooter}`.trim();
</script>

<div class="{baseClasses}">
  {#if $$slots.header}
    <header class="{headerClasses}">
      <slot name="header" />
    </header>
  {/if}

  {#if $$slots.default}
    <section class="{bodyClasses}">
      <slot />
    </section>
  {/if}

  {#if $$slots.footer}
    <footer class="{footerClasses}">
      <slot name="footer" />
    </footer>
  {/if}
</div>
