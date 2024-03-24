<script lang="ts">
import type { CssClasses } from '@skeletonlabs/skeleton';

import type { GlobalMessageType } from '$lib/client/global-messages/types';

export let message: string;
export let type: GlobalMessageType;

const typeClassesMapping: Record<string, CssClasses> = {
  success:
    'bg-success-400-500-token border-success-500-400-token text-on-success-token',
  error:
    'bg-error-400-500-token border-error-500-400-token text-on-error-token',
};
$: typeClasses = typeClassesMapping[type];

$: baseDataTestIdMap = {
  error: 'error-page-message',
  success: 'success-page-message',
};
$: baseDataTestId = baseDataTestIdMap[type] || '';
</script>

<aside class="p-2 text-sm {typeClasses}" data-testid="{baseDataTestId}">
  <p>{message}</p>
</aside>
