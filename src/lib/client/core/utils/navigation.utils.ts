import { goto } from '$app/navigation';

export async function goBack() {
  const currentOrigin = window.location.origin;
  const referrer = document.referrer;

  if (referrer.startsWith(currentOrigin)) {
    window.history.back();
    return;
  }

  await goto('/');
}
