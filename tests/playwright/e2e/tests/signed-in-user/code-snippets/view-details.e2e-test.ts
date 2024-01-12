import { test } from '@playwright/test';
import { CodeSnippetViewDetailsPage } from '../../../page-objects/pages/code-snippets/view-details.page';
import { config } from '../../../../common/lib/config';

const CODE_SNIPPET = config.testData.codeSnippets.forViewing;

test.describe("Feature: View code snippet's details", () => {
  test("Example: Where Signed in user successfully views Code snippet's details", async ({
    page,
  }) => {
    const codeSnippetsViewDetailsPage = new CodeSnippetViewDetailsPage(
      page,
      CODE_SNIPPET.id,
    );
    await codeSnippetsViewDetailsPage.doNavigateTo();

    await codeSnippetsViewDetailsPage.checkCodeSnippetName(CODE_SNIPPET.name);
    await codeSnippetsViewDetailsPage.checkCodeSnippetCode(CODE_SNIPPET.code);
  });
});
