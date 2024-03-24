import { test as setup } from '@playwright/test';

import { config } from '../../common/lib/config';
import {
  saveSignedInUserBeforeSignOutRoleState,
  saveSignedInUserRoleState,
  saveVisitorRoleState,
  seedDb,
  signIn,
} from '../../common/lib/setup';

setup('setup E2E', async ({ page, baseURL }) => {
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
