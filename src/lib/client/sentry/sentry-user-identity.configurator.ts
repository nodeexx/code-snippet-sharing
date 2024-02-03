import { page } from '$app/stores';
import * as Sentry from '@sentry/sveltekit';
import type { Unsubscriber } from 'svelte/store';
import { sentryClientConfigurator } from '$lib/shared/sentry';
import type { AuthUser } from '$lib/shared/lucia/types';
import isEqual from 'lodash/isEqual';

// NOTE: It does not make sense to use Svelte custom store, because there is
// no value to subscribe to. Reactivity is also not needed. Therefor class is
// better for readability.
export class _SentryUserIdentityConfigurator {
  private _isConfigured = false;
  private _isConfigurationStarted = false;
  private unsubscribePage: Unsubscriber | undefined;
  private currentAuthUserData: AuthUser | null = null;

  public get isConfigured(): boolean {
    return this._isConfigured;
  }

  public checkIfConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(`${this.constructor.name} is not configured`);
    }
  }

  public configure(): void {
    sentryClientConfigurator.checkIfConfigured();
    if (this.isConfigured || this._isConfigurationStarted) {
      throw new Error(
        `${this.constructor.name} is in the process of or has already been configured`,
      );
    }
    this._isConfigurationStarted = true;

    this.unsubscribePage = page.subscribe(
      ({ data: { authUser: newAuthUserData } }) => {
        if (isEqual(this.currentAuthUserData, newAuthUserData)) {
          return;
        }
        this.currentAuthUserData = newAuthUserData;

        if (!newAuthUserData) {
          Sentry.setUser(null);
          return;
        }

        Sentry.setUser({
          id: newAuthUserData.userId,
          email: newAuthUserData.email,
        });
      },
    );

    this._isConfigured = true;
    this._isConfigurationStarted = false;
  }

  public cleanup(): void {
    this.checkIfConfigured();

    this.unsubscribePage?.();

    this._isConfigured = false;
  }
}

export const sentryUserIdentityConfigurator =
  new _SentryUserIdentityConfigurator();
