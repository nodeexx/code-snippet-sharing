import { expect, test } from '@playwright/test';

import { config } from '../../../../common/lib/config';
import { HomePage } from '../../../../e2e/page-objects/pages/home.page';

const CODE_SNIPPET = config.testData.codeSnippets.forEditing;

test.describe('POST /code-snippets/:id/edit?/edit', () => {
  test('successfully edits a code snippet and returns a message', async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) {
      throw new Error('Base URL is not set');
    }

    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    const response = await page.request.post(
      `/code-snippets/${CODE_SNIPPET.id}/edit?/edit`,
      {
        headers: {
          // Needed to pass CSRF check
          origin: baseURL,
        },
        multipart: {
          name: CODE_SNIPPET.newName,
          code: CODE_SNIPPET.code,
        },
      },
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      data: `[{"form":1},{"id":2,"valid":3,"posted":3,"errors":4,"data":5,"constraints":8,"message":12},"erwwt8",true,{},{"name":6,"code":7},"${CODE_SNIPPET.newName}","${CODE_SNIPPET.code}",{"name":9,"code":11},{"minlength":10,"required":3},1,{"minlength":10,"required":3},{"type":13,"message":14},"success","Code snippet edited"]`,
      status: 200,
      type: 'success',
    });
  });
});
