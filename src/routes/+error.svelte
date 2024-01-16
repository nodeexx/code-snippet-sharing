<script lang="ts">
import { page } from '$app/stores';
import { Error } from '$lib/client/components/app-shell';
import { config } from '$lib/client/core/config';

let title = `Error ${$page.status}`;
let message = $page.error?.message || 'Unknown error';
// NOTE: During SSR, unhandled error in `*.svelte` file outside of lifecycle
// hooks result in a 500 status code.
let showAppBar = $page.status < 500;

if ($page.status === 404) {
  title = 'Page Not Found';
  message = 'Sorry, the page you are looking for does not exist.';
}

if ($page.status === 503) {
  title = 'Site under maintenance';
  message =
    "Hey there! We're just sprucing up our site a bit. Please check back soon - it won't take long!";
}
</script>

<svelte:head>
  <title>{title}{config.pageTitleSuffix}</title>
</svelte:head>

<Error {title} {message} {showAppBar} />
