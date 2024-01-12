import { test } from '@playwright/test';
import { HomePage } from '../../../page-objects/pages/home.page.js';
import { CodeSnippetEditPage } from '../../../page-objects/pages/code-snippets/edit.page.js';
import { config } from '../../../../common/lib/config';

const CODE_SNIPPET = config.testData.codeSnippets.forEditing;

test.describe('Feature: Edit a code snippet', () => {
  test('Example: Where Signed in user successfully edits a Code snippet', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();
    await homePage.checkTextVisible(CODE_SNIPPET.name);
    await homePage.checkTextHidden(CODE_SNIPPET.newName);

    const codeSnippetCreatePage = new CodeSnippetEditPage(
      page,
      CODE_SNIPPET.id,
    );
    await codeSnippetCreatePage.doNavigateTo();

    await codeSnippetCreatePage.doClickNameInput();
    await codeSnippetCreatePage.doFillNameInput(CODE_SNIPPET.newName);
    await codeSnippetCreatePage.doClickConfirmButton();

    await homePage.doNavigateTo();
    await homePage.checkTextHidden(CODE_SNIPPET.name);
    await homePage.checkTextVisible(CODE_SNIPPET.newName);
  });
});
