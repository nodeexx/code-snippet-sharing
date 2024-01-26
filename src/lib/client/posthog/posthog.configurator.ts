import posthog from 'posthog-js';

// NOTE: There is no way to check if the Posthog package has been initialized,
// hence the need for this class.
export class PosthogConfigurator {
  private static _isConfigured = false;
  private static _isConfigurationStarted = false;

  public static get isConfigured(): boolean {
    return this._isConfigured;
  }

  public static checkIfConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(`${this.name} is not configured`);
    }
  }

  public static configure(
    projectApiKey: string | undefined,
    apiHost: string | undefined,
  ): void {
    if (this.isConfigured || this._isConfigurationStarted) {
      throw new Error(
        `${this.name} is in the process of or has already been configured`,
      );
    }
    this._isConfigurationStarted = true;

    this.checkConfigurationInputs(projectApiKey, apiHost);

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

  public static areConfigurationInputsValid(
    projectApiKey: string | undefined,
    apiHost: string | undefined,
  ): boolean {
    return !!projectApiKey && !!apiHost;
  }

  private static checkConfigurationInputs(
    projectApiKey: string | undefined,
    apiHost: string | undefined,
  ): void {
    if (!this.areConfigurationInputsValid(projectApiKey, apiHost)) {
      throw new Error(
        `${this.name} configuration inputs are invalid - projectApiKey: ${projectApiKey}, apiHost: ${apiHost}`,
      );
    }
  }
}
