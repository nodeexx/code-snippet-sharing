import { expect, test } from '@playwright/test';

import { HomePage } from '../../page-objects/pages/home.page.js';
import { SignInPage } from '../../page-objects/pages/sign-in.page.js';

test.describe('Feature: Sign in/Sign up via Google', () => {
  test.describe('Example: Where Visitor successfully signs in using his/her Google account', () => {
    test('Part: Until Google Sign In page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.doNavigateTo();

      await expect(
        homePage.componentNavigationBar.getSignInButton(),
      ).toBeVisible();
      await expect(
        homePage.componentNavigationBar.getProfileButton(),
      ).not.toBeVisible();

      await homePage.componentNavigationBar.doClickSignInButton();

      const signInPage = new SignInPage(page);
      await signInPage.doWaitForURL();

      await signInPage.doClickSignInWithGoogleButton();
      await page.waitForURL(/^https:\/\/accounts.google.com/);
    });
  });
});
