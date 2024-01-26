import { navigating } from '$app/stores';
import {
  POSTHOG_PAGE_LEAVE_EVENT_NAME,
  POSTHOG_PAGE_VIEW_EVENT_NAME,
} from '$lib/shared/posthog/constants';
import posthog from 'posthog-js';
import type { Unsubscriber } from 'svelte/store';
import { PosthogConfigurator } from './posthog.configurator';

enum PageEventTrigger {
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
export class PosthogDefaultPageEventsCaptureConfigurator {
  private static _isConfigured = false;
  private static _isConfigurationStarted = false;
  private static isSiteLoaded = false;
  private static unsubscribeNavigating: Unsubscriber | undefined;

  // NOTE: Arrow functions are used to preserve `this` context.
  private static handleBeforeUnload = (): void => {
    this.isSiteLoaded = false;
    this.capturePageLeaveEvent(PageEventTrigger.BEFORE_UNLOAD);
  };
  private static handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      if (!this.isSiteLoaded) {
        // NOTE: To prevent capturing duplicate page leave event when the
        // `beforeunload` event is also fired, because it is fired before the
        // `visibilitychange` event.
        return;
      }

      this.capturePageLeaveEvent(PageEventTrigger.VISIBILITY_HIDDEN);
      return;
    }

    this.capturePageViewEvent(PageEventTrigger.VISIBILITY_VISIBLE);
  };

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

    window.addEventListener('beforeunload', this.handleBeforeUnload);
    // NOTE: `visibilitychange` event is more reliable than `beforeunload` on
    // mobile devices.
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
    window.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.unsubscribeNavigating = navigating.subscribe(($navigating) => {
      // NOTE: Does not react to unload events.
      if ($navigating) {
        this.capturePageLeaveEvent(PageEventTrigger.BEFORE_NAVIGATE);
        return;
      }

      if (!this.isSiteLoaded) {
        this.capturePageViewEvent(PageEventTrigger.AFTER_LOAD);
        this.isSiteLoaded = true;
        return;
      }
      this.capturePageViewEvent(PageEventTrigger.AFTER_NAVIGATE);
    });

    this._isConfigured = true;
    this._isConfigurationStarted = false;
  }

  public static cleanup(): void {
    PosthogConfigurator.checkIfConfigured();

    this.unsubscribeNavigating?.();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this._isConfigured = false;
  }

  private static capturePageViewEvent(trigger: PageEventTrigger): void {
    posthog.capture(POSTHOG_PAGE_VIEW_EVENT_NAME, {
      trigger,
    });
  }
  private static capturePageLeaveEvent(trigger: PageEventTrigger): void {
    posthog.capture(POSTHOG_PAGE_LEAVE_EVENT_NAME, {
      trigger,
    });
  }
}
