import { expect, test } from '@playwright/test';

import { config } from '../../../../common/lib/config';
import { HomePage } from '../../../../e2e/page-objects/pages/home.page';

const CODE_SNIPPET = config.testData.codeSnippets.forCreation;

test.describe('POST /code-snippets/create?/create', () => {
  test('successfully creates a code snippet and redirects to home page', async ({
    page,
    baseURL,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    const response = await page.request.post('/code-snippets/create?/create', {
      headers: {
        // Needed to pass CSRF check
        origin: baseURL!,
      },
      multipart: {
        name: CODE_SNIPPET.name,
        code: CODE_SNIPPET.code,
      },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      location: '/',
      status: 307,
      type: 'redirect',
    });
  });
});
