import { test } from '@playwright/test';

import { config } from '../../../../common/lib/config';
import { CodeSnippetCreatePage } from '../../../page-objects/pages/code-snippets/create.page.js';
import { HomePage } from '../../../page-objects/pages/home.page.js';

const CODE_SNIPPET = config.testData.codeSnippets.forCreation;

test.describe('Feature: Create a code snippet', () => {
  test('Example: Where Signed in user successfully creates a Code snippet', async ({
    page,
  }) => {
    const codeSnippetCreatePage = new CodeSnippetCreatePage(page);
    await codeSnippetCreatePage.doNavigateTo();

    await codeSnippetCreatePage.doClickNameInput();
    await codeSnippetCreatePage.doFillNameInput(CODE_SNIPPET.name);
    await codeSnippetCreatePage.doClickCodeInput();
    await codeSnippetCreatePage.doFillCodeInput(CODE_SNIPPET.code);
    await codeSnippetCreatePage.doClickConfirmButton();

    const homePage = new HomePage(page);
    await homePage.doWaitForURL();
    await homePage.doSelectCreationDateSortingDropdownOption('desc');
    await homePage.checkTextVisible(CODE_SNIPPET.name);
  });
});
