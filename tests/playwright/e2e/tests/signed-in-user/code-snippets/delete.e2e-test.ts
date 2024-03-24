import { test } from '@playwright/test';

import { config } from '../../../../common/lib/config';
import { CodeSnippetViewDetailsPage } from '../../../page-objects/pages/code-snippets/view-details.page';
import { HomePage } from '../../../page-objects/pages/home.page';

const CODE_SNIPPET = config.testData.codeSnippets.forDeletion;

test.describe('Feature: Delete a code snippet', () => {
  test('Example: Where Signed in user successfully deletes a Code snippet', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();
    await homePage.checkTextVisible(CODE_SNIPPET.name);

    const codeSnippetViewDetailsPage = new CodeSnippetViewDetailsPage(
      page,
      CODE_SNIPPET.id,
    );
    await codeSnippetViewDetailsPage.doNavigateTo();
    await codeSnippetViewDetailsPage.doClickDeleteButton();

    await homePage.doNavigateTo();
    await homePage.checkTextHidden(CODE_SNIPPET.name);
  });
});
