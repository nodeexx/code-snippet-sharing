import { areSentryClientConfigurationInputsValid } from './utils';
import * as Sentry from '@sentry/sveltekit';

export class _SentryClientConfigurator {
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
    dsn: string | undefined,
    environment: string | undefined,
  ): void {
    if (this.isConfigured || this._isConfigurationStarted) {
      throw new Error(
        `${this.constructor.name} is in the process of or has already been configured`,
      );
    }
    this._isConfigurationStarted = true;

    this.checkConfigurationInputs(dsn, environment);

    Sentry.init({
      dsn: dsn!,
      environment: environment!,
      tracesSampleRate: 1,
    });

    this._isConfigured = true;
    this._isConfigurationStarted = false;
  }

  private checkConfigurationInputs(
    dsn: string | undefined,
    environment: string | undefined,
  ): void {
    if (!areSentryClientConfigurationInputsValid(dsn, environment)) {
      throw new Error(
        `${this.constructor.name}: One or both configuration inputs are invalid` +
          ` - dsn: ${dsn}, apiHost: ${environment}`,
      );
    }
  }
}

export const sentryClientConfigurator = new _SentryClientConfigurator();
