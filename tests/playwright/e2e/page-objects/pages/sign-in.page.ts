import { expect, type Locator, type Page } from '@playwright/test';

export class SignInPage {
  urlPath = '/sign-in';
  urlPathRegex = RegExp(`${this.urlPath}[^/]*`);

  constructor(public page: Page) {}

  public getTitle(): Promise<string> {
    return this.page.title();
  }

  public async doNavigateTo(): Promise<void> {
    await this.page.goto(this.urlPath, { waitUntil: 'domcontentloaded' });
    // Vite dev sometimes needs more time to connect to page
    await this.page.waitForTimeout(1000);
  }

  public async doWaitForURL(): Promise<void> {
    await this.page.waitForURL(this.urlPathRegex);
  }

  public getSignInWithGoogleButton(): Locator {
    return this.getButtonWithText('Sign in with Google');
  }

  public doClickSignInWithGoogleButton(): Promise<void> {
    return this.getSignInWithGoogleButton().click();
  }

  public async checkTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  private getButtonWithText(text: string): Locator {
    return this.page.getByRole('button', { name: text });
  }
}
