import { expect, test } from '@playwright/test';

import { HomePage } from '../../page-objects/pages/home.page.js';
import { ProfilePage } from '../../page-objects/pages/profile.page.js';

test.describe('Feature: Sign out', () => {
  test('Example: Where Signed in user successfully signs out', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    await expect(
      homePage.componentNavigationBar.getSignInButton(),
    ).not.toBeVisible();
    await expect(
      homePage.componentNavigationBar.getProfileButton(),
    ).toBeVisible();

    await homePage.componentNavigationBar.doClickProfileButton();
    const profilePage = new ProfilePage(page);
    await profilePage.doWaitForURL();

    await profilePage.doClickSignOutButton();
    await homePage.doWaitForURL();

    await expect(
      homePage.componentNavigationBar.getSignInButton(),
    ).toBeVisible();
    await expect(
      homePage.componentNavigationBar.getProfileButton(),
    ).not.toBeVisible();
  });
});
