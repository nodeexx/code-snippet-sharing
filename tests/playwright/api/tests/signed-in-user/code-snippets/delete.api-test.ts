import { expect, test } from '@playwright/test';

import { config } from '../../../../common/lib/config';
import { HomePage } from '../../../../e2e/page-objects/pages/home.page';

const CODE_SNIPPET = config.testData.codeSnippets.forDeletion;

test.describe('POST /code-snippets/:id?/delete', () => {
  test('successfully deletes a code snippet and redirects to root path', async ({
    page,
    baseURL,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    const response = await page.request.post(
      `/code-snippets/${CODE_SNIPPET.id}?/delete`,
      {
        headers: {
          // Needed to pass CSRF check
          origin: baseURL!,
        },
        multipart: {},
      },
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      location: '/',
      status: 307,
      type: 'redirect',
    });
  });
});
