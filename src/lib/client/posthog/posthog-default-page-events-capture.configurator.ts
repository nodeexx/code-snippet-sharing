import { navigating } from '$app/stores';
import {
  POSTHOG_PAGE_LEAVE_EVENT_NAME,
  POSTHOG_PAGE_VIEW_EVENT_NAME,
} from '$lib/shared/posthog/constants';
import type { Unsubscriber } from 'svelte/store';
import { posthog } from './client';
import { checkIfPosthogClientConfigured } from '$lib/shared/posthog/utils';

export enum _PageEventTrigger {
  VISIBILITY_VISIBLE = 'visibility-visible',
  VISIBILITY_HIDDEN = 'visibility-hidden',
  // NOTE: Only indirect relationship to the `load` event.
  AFTER_LOAD = 'after-load',
  BEFORE_UNLOAD = 'before-unload',
  BEFORE_NAVIGATE = 'before-navigate',
  AFTER_NAVIGATE = 'after-navigate',
}

// NOTE: It does not make sense to use Svelte custom store, because there is
// no value to subscribe to. Reactivity is also not needed. Therefor class is
// better for readability.
export class _PosthogDefaultPageEventsCaptureConfigurator {
  private _isConfigured = false;
  private _isConfigurationStarted = false;
  private isSiteLoaded = false;
  private unsubscribeNavigating: Unsubscriber | undefined;

  // NOTE: Arrow functions are used to preserve `this` context.
  private handleBeforeUnload = (): void => {
    this.isSiteLoaded = false;
    this.capturePageLeaveEvent(_PageEventTrigger.BEFORE_UNLOAD);
  };
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      if (!this.isSiteLoaded) {
        // NOTE: To prevent capturing duplicate page leave event when the
        // `beforeunload` event is also fired, because it is fired before the
        // `visibilitychange` event.
        return;
      }

      this.capturePageLeaveEvent(_PageEventTrigger.VISIBILITY_HIDDEN);
      return;
    }

    this.capturePageViewEvent(_PageEventTrigger.VISIBILITY_VISIBLE);
  };

  public get isConfigured(): boolean {
    return this._isConfigured;
  }

  public checkIfConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(`${this.constructor.name} is not configured`);
    }
  }

  public configure(): void {
    checkIfPosthogClientConfigured(posthog);
    if (this.isConfigured || this._isConfigurationStarted) {
      throw new Error(
        `${this.constructor.name} is in the process of or has already been configured`,
      );
    }
    this._isConfigurationStarted = true;

    window.addEventListener('beforeunload', this.handleBeforeUnload);
    // NOTE: `visibilitychange` event is more reliable than `beforeunload` on
    // mobile devices.
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
    window.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.unsubscribeNavigating = navigating.subscribe(($navigating) => {
      // NOTE: Does not react to unload events (in case when closing browser?).
      // WARN: Navigation after `popstate` event happens before this runs, so
      // page leave event is captured for the destination page, not the source
      // one. No solution for now (`beforeNavigate` also did not help).
      if ($navigating && $navigating.willUnload === false) {
        this.capturePageLeaveEvent(_PageEventTrigger.BEFORE_NAVIGATE);
        return;
      }

      if (!this.isSiteLoaded) {
        this.capturePageViewEvent(_PageEventTrigger.AFTER_LOAD);
        this.isSiteLoaded = true;
        return;
      }
      this.capturePageViewEvent(_PageEventTrigger.AFTER_NAVIGATE);
    });

    this._isConfigured = true;
    this._isConfigurationStarted = false;
  }

  public cleanup(): void {
    this.checkIfConfigured();

    this.unsubscribeNavigating?.();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this._isConfigured = false;
  }

  private capturePageViewEvent(trigger: _PageEventTrigger): void {
    posthog!.capture(POSTHOG_PAGE_VIEW_EVENT_NAME, {
      trigger,
    });
  }
  private capturePageLeaveEvent(trigger: _PageEventTrigger): void {
    posthog!.capture(POSTHOG_PAGE_LEAVE_EVENT_NAME, {
      trigger,
    });
  }
}

export const posthogDefaultPageEventsCaptureConfigurator =
  new _PosthogDefaultPageEventsCaptureConfigurator();
