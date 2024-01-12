import { expect, type Locator, type Page } from '@playwright/test';

export class CodeSnippetViewDetailsPage {
  urlPath: string;
  urlPathRegex: RegExp;

  constructor(
    public page: Page,
    public codeSnippetId: number,
  ) {
    this.urlPath = `/code-snippets/${this.codeSnippetId}`;
    this.urlPathRegex = RegExp(`${this.urlPath}[^/]*`);
  }

  public getTitle(): Promise<string> {
    return this.page.title();
  }

  public getCodeSnippetHeading(name: string): Locator {
    return this.page.getByRole('heading', {
      name,
    });
  }

  public getCodeSnippetCodeBlock(code: string): Locator {
    const codeBlockElement = this.page.getByTestId('codeblock');
    // Find `pre` inside `codeBlockElement`
    // return codeBlockElement.locator('pre');
    return codeBlockElement.locator('pre', {
      hasText: code,
    });
  }

  public getEditButton(): Locator {
    return this.getButtonWithText('Edit');
  }

  public getDeleteButton(): Locator {
    return this.getButtonWithText('Delete');
  }

  public async doNavigateTo(): Promise<void> {
    await this.page.goto(this.urlPath, { waitUntil: 'domcontentloaded' });
    // Vite dev sometimes needs more time to connect to page
    await this.page.waitForTimeout(1000);
  }

  public async doWaitForURL(): Promise<void> {
    await this.page.waitForURL(this.urlPathRegex);
  }

  public doClickEditButton(): Promise<void> {
    return this.getEditButton().click();
  }

  public doClickDeleteButton(): Promise<void> {
    return this.getDeleteButton().click();
  }

  public async checkTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  public async checkCodeSnippetName(name: string): Promise<void> {
    await expect(this.getCodeSnippetHeading(name)).toBeVisible();
  }

  public async checkCodeSnippetCode(code: string): Promise<void> {
    await expect(this.getCodeSnippetCodeBlock(code)).toBeVisible();
  }

  private getButtonWithText(text: string): Locator {
    return this.page.getByRole('button', { name: text });
  }
}
