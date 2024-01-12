import type { Locator, Page } from '@playwright/test';

export class NavigationBarComponent {
  constructor(public page: Page) {}

  public getSignInButton(): Locator {
    return this.getButtonWithText('Sign in');
  }

  public getProfileButton(): Locator {
    return this.getButtonWithText('Profile');
  }

  public doClickSignInButton(): Promise<void> {
    return this.getSignInButton().click();
  }

  public async doClickProfileButton(): Promise<void> {
    await this.getProfileButton().click();
  }

  private getButtonWithText(text: string): Locator {
    return this.page.getByRole('button', { name: text });
  }
}
