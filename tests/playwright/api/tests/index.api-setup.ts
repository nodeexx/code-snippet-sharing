import { test as setup } from '@playwright/test';
import {
  signIn,
  saveSignedInUserBeforeSignOutRoleState,
  saveSignedInUserRoleState,
  saveVisitorRoleState,
  seedDb,
} from '../../common/lib/setup';
import { config } from '../../common/lib/config';

setup('setup API', async ({ page, baseURL }) => {
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
