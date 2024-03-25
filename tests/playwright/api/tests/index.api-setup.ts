import { test as setup } from '@playwright/test';

import { config } from '../../common/lib/config';
import {
  saveSignedInUserBeforeSignOutRoleState,
  saveSignedInUserRoleState,
  saveVisitorRoleState,
  seedDb,
  signIn,
} from '../../common/lib/setup';

setup('setup API', async ({ page, baseURL }) => {
  if (!baseURL) {
    throw new Error('Base URL is not set');
  }

  seedDb();
  await saveVisitorRoleState(page);

  await signIn(page, baseURL, config.testData.authSessionCookie.value);
  await saveSignedInUserRoleState(page);

  await page.context().clearCookies();
  await signIn(
    page,
    baseURL,
    config.testData.authSessionCookie.signOutTestsValue,
  );
  await saveSignedInUserBeforeSignOutRoleState(page);
});
