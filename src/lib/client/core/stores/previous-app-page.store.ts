import { navigating } from '$app/stores';
import type { NavigationTarget } from '@sveltejs/kit';
import {
  writable,
  type Unsubscriber,
  type Subscriber,
  type Invalidator,
} from 'svelte/store';

export function _createPreviousAppPageStore() {
  const previousAppPage = writable<NavigationTarget | undefined>();

  function subscribe(
    run: Subscriber<NavigationTarget | undefined>,
    invalidate?: Invalidator<NavigationTarget | undefined>,
  ): Unsubscriber {
    const unsubscribePreviousAppPage = previousAppPage.subscribe(
      run,
      invalidate,
    );

    const unsubscribeNavigating = navigating.subscribe(($navigating) => {
      if (!$navigating) {
        // After navigation
        return;
      }

      // Before navigation
      previousAppPage.set($navigating.from ?? undefined);
    });

    return () => {
      unsubscribeNavigating();
      unsubscribePreviousAppPage();
    };
  }

  return { subscribe };
}

export const previousAppPage = _createPreviousAppPageStore();
