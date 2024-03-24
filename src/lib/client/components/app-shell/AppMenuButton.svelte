<script lang="ts">
import IconUser from '~icons/fa6-solid/user';
import { page } from '$app/stores';
import {
  encodeOriginalPath,
  ORIGINAL_PATH_URL_QUERY_PARAM_NAME,
} from '$lib/shared/core/utils';

$: signInPath = getSignInPath($page.url);

function getSignInPath(currentUrl: URL): string {
  return `/sign-in?${ORIGINAL_PATH_URL_QUERY_PARAM_NAME}=${encodeOriginalPath(
    currentUrl,
  )}`;
}
</script>

{#if $page.data.authUser}
  <a href="/profile" data-testid="profile-anchor">
    <button type="button" class="variant-filled-surface btn">
      <span>
        <IconUser />
      </span>
      <span>Profile</span>
    </button>
  </a>
{:else}
  <a href="{signInPath}" data-testid="sign-in-anchor">
    <button class="variant-filled-surface btn">
      <span>Sign in</span>
    </button>
  </a>
{/if}
