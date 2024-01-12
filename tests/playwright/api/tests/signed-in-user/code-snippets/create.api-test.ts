import { test, expect } from '@playwright/test';
import { HomePage } from '../../../../e2e/page-objects/pages/home.page';
import { config } from '../../../../common/lib/config';

const CODE_SNIPPET = config.testData.codeSnippets.forCreation;

test.describe('POST /code-snippets/create?/create', () => {
  test('successfully creates a code snippet and redirects to home page', async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) {
      throw new Error('Base URL is not set');
    }

    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    const response = await page.request.post('/code-snippets/create?/create', {
      headers: {
        // Needed to pass CSRF check
        origin: baseURL,
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
