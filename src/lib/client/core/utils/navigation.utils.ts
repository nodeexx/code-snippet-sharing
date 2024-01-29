import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { previousAppPage } from '../stores/previous-app-page.store';

export async function goBack() {
  const previousAppPageUrl = get(previousAppPage)?.url;
  if (previousAppPageUrl) {
    await goto(previousAppPageUrl);
    return;
  }

  const currentOrigin = get(page).url.origin;
  const referrer = document.referrer;
  if (referrer.startsWith(currentOrigin) || referrer.startsWith('/')) {
    await goto(referrer);
    return;
  }

  await goto('/');
}
