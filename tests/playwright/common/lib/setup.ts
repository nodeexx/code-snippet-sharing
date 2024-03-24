import { expect, type Page } from '@playwright/test';
import dayjs from 'dayjs';
import path from 'path';
import shelljs from 'shelljs';

import { HomePage } from '../../e2e/page-objects/pages/home.page';
import { config } from './config';
import { COMMON_SAVED_STATES_FOLDER } from './constants';

export async function signIn(
  page: Page,
  baseURL: string | undefined,
  authSessionCookieValue: string,
): Promise<void> {
  if (!baseURL) {
    throw new Error('Base URL not set');
  }

  const url = new URL(baseURL);
  const hostname = url.hostname;
  await page.context().addCookies([
    {
      name: config.testData.authSessionCookie.name,
      domain: hostname,
      path: '/',
      value: authSessionCookieValue,
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      expires: dayjs().add(1, 'day').unix(),
    },
  ]);
}

export async function saveVisitorRoleState(page: Page): Promise<void> {
  const homePage = new HomePage(page);
  await homePage.doNavigateTo();

  await expect(homePage.componentNavigationBar.getSignInButton()).toBeVisible();
  await expect(
    homePage.componentNavigationBar.getProfileButton(),
  ).not.toBeVisible();

  await page.context().storageState({
    path: path.join(COMMON_SAVED_STATES_FOLDER, 'visitor.json'),
  });
}

export async function saveSignedInUserRoleState(page: Page): Promise<void> {
  const homePage = new HomePage(page);
  await homePage.doNavigateTo();
  await expect(
    homePage.componentNavigationBar.getSignInButton(),
  ).not.toBeVisible();
  await expect(
    homePage.componentNavigationBar.getProfileButton(),
  ).toBeVisible();

  await page.context().storageState({
    path: path.join(COMMON_SAVED_STATES_FOLDER, 'signed-in-user.json'),
  });
}

export async function saveSignedInUserBeforeSignOutRoleState(
  page: Page,
): Promise<void> {
  const homePage = new HomePage(page);
  await homePage.doNavigateTo();
  await expect(
    homePage.componentNavigationBar.getSignInButton(),
  ).not.toBeVisible();
  await expect(
    homePage.componentNavigationBar.getProfileButton(),
  ).toBeVisible();

  await page.context().storageState({
    path: path.join(
      COMMON_SAVED_STATES_FOLDER,
      `signed-in-user--before-sign-out.json`,
    ),
  });
}

export function seedDb(): void {
  const result = shelljs.exec('npm run db:seed:playwright');
  if (result.code !== 0) {
    throw new Error(
      `Seeding before running Playwright tests failed: ${result.stderr}`,
    );
  }
}
