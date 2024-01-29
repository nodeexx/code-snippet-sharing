import { arePosthogClientConfigurationInputsValid } from '$lib/shared/posthog/utils';
import posthog from 'posthog-js';

// NOTE: There is no way to check if the Posthog package has been initialized,
// hence the need for this class.
export class _PosthogClientConfigurator {
  private _isConfigured = false;
  private _isConfigurationStarted = false;
  private _isConfigurationFailed = false;

  public get isConfigured(): boolean {
    return this._isConfigured;
  }

  public get isConfigurationFailed(): boolean {
    return this._isConfigurationFailed;
  }

  public checkIfConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(`${this.constructor.name} is not configured`);
    }
  }

  public failConfiguration(): void {
    this._isConfigurationFailed = true;
  }

  public configure(
    projectApiKey: string | undefined,
    apiHost: string | undefined,
  ): void {
    if (this.isConfigured || this._isConfigurationStarted) {
      throw new Error(
        `${this.constructor.name} is in the process of or has already been configured`,
      );
    }
    this._isConfigurationStarted = true;

    this.checkConfigurationInputs(projectApiKey, apiHost);

    // NOTE: `posthog.init` does not validate project API key and API host
    // at all, invalid value cause problems later when Posthog client tries
    // to send events to the API.
    posthog.init(projectApiKey!, {
      api_host: apiHost!,
      persistence: 'memory',
      autocapture: true,
      capture_pageview: false,
      capture_pageleave: false,
    });

    this._isConfigured = true;
    this._isConfigurationStarted = false;
  }

  private checkConfigurationInputs(
    projectApiKey: string | undefined,
    apiHost: string | undefined,
  ): void {
    if (!arePosthogClientConfigurationInputsValid(projectApiKey, apiHost)) {
      throw new Error(
        `${this.constructor.name}: One or both configuration inputs are invalid` +
          ` - projectApiKey: ${projectApiKey}, apiHost: ${apiHost}`,
      );
    }
  }
}

export const posthogClientConfigurator = new _PosthogClientConfigurator();
