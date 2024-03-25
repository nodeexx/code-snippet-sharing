import { expect, type Page, test } from '@playwright/test';

import { config } from '../../../common/lib/config';
import { HomePage } from '../../../e2e/page-objects/pages/home.page';

test.describe('POST /profile?/sign-out', () => {
  test('successfully logs user out and redirects to home page', async ({
    page,
    baseURL,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    expect(await doesAuthSessionCookieExist(page)).toBe(true);

    const response = await page.request.post('/profile?/sign-out', {
      headers: {
        // Needed to pass CSRF check
        origin: baseURL!,
      },
      form: {},
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      location: '/',
      status: 307,
      type: 'redirect',
    });
    expect(await doesAuthSessionCookieExist(page)).toBe(false);
  });

  test('returns 401 if user is not logged in', async ({ page, baseURL }) => {
    await page.context().clearCookies();
    const response = await page.request.post('/profile?/sign-out', {
      headers: {
        // Needed to pass CSRF check
        origin: baseURL!,
      },
      form: {},
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      type: 'failure',
      status: 401,
      data: '[{"form":1},{"id":2,"valid":3,"posted":4,"errors":5,"data":6,"constraints":7,"message":8},"0",false,true,{},{},{},{"type":9,"message":10},"error","User is not authenticated"]',
    });
  });
});

async function doesAuthSessionCookieExist(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  const authSessionCookie = cookies.find(
    (cookie) => cookie.name === config.testData.authSessionCookie.name,
  );

  return !!authSessionCookie;
}
