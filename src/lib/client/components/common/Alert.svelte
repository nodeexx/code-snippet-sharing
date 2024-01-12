<script lang="ts">
import IconTriangleExclamation from '~icons/fa6-solid/triangle-exclamation';
import IconCircleCheck from '~icons/fa6-solid/circle-check';
import type { GlobalMessageType } from '$lib/client/global-messages/types';
import type { ComponentType } from 'svelte';

export let type: GlobalMessageType;
export let message: string;

let typeMap: Record<
  string,
  {
    iconComponent: ComponentType;
    baseClass: string;
    baseDataTestId: string;
  }
>;
$: typeMap = {
  error: {
    iconComponent: IconTriangleExclamation,
    baseClass: 'variant-filled-error',
    baseDataTestId: 'error-alert',
  },
  success: {
    iconComponent: IconCircleCheck,
    baseClass: 'variant-filled-success',
    baseDataTestId: 'success-alert',
  },
};

const defaultClasses = {
  base: 'alert w-full',
};

$: baseClasses = `${defaultClasses.base} ${$$props['class'] ?? ''} ${
  typeMap[type]?.baseClass || ''
}`
  .trim()
  // NOTE: Replace multiple spaces with one
  .replace(/[ ]{2,}/g, ' ');

$: baseDataTestId = typeMap[type]?.baseDataTestId || '';
$: iconComponent = typeMap[type]?.iconComponent || null;
</script>

<aside class="{baseClasses}" data-testid="{baseDataTestId}">
  <span>
    <svelte:component this="{iconComponent}" />
  </span>
  <div class="alert-message">
    <p>{message}</p>
  </div>
</aside>
