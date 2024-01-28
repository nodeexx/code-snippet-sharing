import { page } from '$app/stores';
import posthog from 'posthog-js';
import type { Unsubscriber } from 'svelte/store';
import { PosthogConfigurator } from './posthog.configurator';
import type { AuthUser } from '$lib/shared/lucia/types';
import isEqual from 'lodash/isEqual';

// NOTE: It does not make sense to use Svelte custom store, because there is
// no value to subscribe to. Reactivity is also not needed. Therefor class is
// better for readability.
export class PosthogUserIdentityConfigurator {
  private static _isConfigured = false;
  private static _isConfigurationStarted = false;
  private static unsubscribePage: Unsubscriber | undefined;
  private static currentAuthUserData: AuthUser | null = null;

  public static get isConfigured(): boolean {
    return this._isConfigured;
  }

  public static checkIfConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(`${this.name} is not configured`);
    }
  }

  public static configure(): void {
    PosthogConfigurator.checkIfConfigured();
    if (this.isConfigured || this._isConfigurationStarted) {
      throw new Error(
        `${this.name} is in the process of or has already been configured`,
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
          posthog.reset();
          return;
        }

        posthog.identify(newAuthUserData.userId, {
          id: newAuthUserData.userId,
          email: newAuthUserData.email,
          email_verified: newAuthUserData.email_verified,
          created_at: newAuthUserData.created_at.toISOString(),
        });
      },
    );

    this._isConfigured = true;
    this._isConfigurationStarted = false;
  }

  public static cleanup(): void {
    PosthogConfigurator.checkIfConfigured();

    this.unsubscribePage?.();

    this._isConfigured = false;
  }
}
