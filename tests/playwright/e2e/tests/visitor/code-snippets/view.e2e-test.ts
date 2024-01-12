import { test } from '@playwright/test';
import { config } from '../../../../common/lib/config';
import { HomePage } from '../../../page-objects/pages/home.page';

const FIRST_CODE_SNIPPET = config.testData.codeSnippets.forViewing;
const LAST_CODE_SNIPPET = config.testData.codeSnippets.forPaginationCheck;

test.describe('Feature: View all code snippets', () => {
  test('Example: Where Visitor successfully accesses a list of all Code snippets', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    await homePage.checkTextVisible(FIRST_CODE_SNIPPET.name);
    await homePage.checkTextHidden(LAST_CODE_SNIPPET.name);

    await homePage.doClickNextPageButton();

    await homePage.checkTextHidden(FIRST_CODE_SNIPPET.name);
    await homePage.checkTextVisible(LAST_CODE_SNIPPET.name);
  });

  test('Example: Where Visitor successfully accesses a list of all Code snippets in descending order based on their creation dates', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.doNavigateTo();

    await homePage.checkTextVisible(FIRST_CODE_SNIPPET.name);
    await homePage.checkTextHidden(LAST_CODE_SNIPPET.name);

    await homePage.doSelectCreationDateSortingDropdownOption('desc');

    await homePage.checkTextHidden(FIRST_CODE_SNIPPET.name);
    await homePage.checkTextVisible(LAST_CODE_SNIPPET.name);
  });
});
