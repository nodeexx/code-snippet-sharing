import { test, expect } from '@playwright/test';
import { HomePage } from '../../../../e2e/page-objects/pages/home.page';
import { config } from '../../../../common/lib/config';

const CODE_SNIPPET = config.testData.codeSnippets.forDeletion;

test.describe('POST /code-snippets/:id?/delete', () => {
  test('successfully deletes a code snippet and redirects to root path', async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) {
      throw new Error('Base URL is not set');
    }

    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    const response = await page.request.post(
      `/code-snippets/${CODE_SNIPPET.id}?/delete`,
      {
        headers: {
          // Needed to pass CSRF check
          origin: baseURL,
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
