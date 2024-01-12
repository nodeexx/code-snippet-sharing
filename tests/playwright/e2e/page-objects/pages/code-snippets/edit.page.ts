import { expect, type Locator, type Page } from '@playwright/test';

export class CodeSnippetEditPage {
  urlPath: string;
  urlPathRegex: RegExp;

  constructor(
    public page: Page,
    public codeSnippetId: number,
  ) {
    this.urlPath = `/code-snippets/${this.codeSnippetId}/edit`;
    this.urlPathRegex = RegExp(`${this.urlPath}[^/]*`);
  }

  public getTitle(): Promise<string> {
    return this.page.title();
  }

  public getNameInput(): Locator {
    return this.getInputByPlaceholder('Code snippet name');
  }

  public getCodeInput(): Locator {
    return this.getInputByPlaceholder('Code snippet', true);
  }

  public getConfirmButton(): Locator {
    return this.getButtonWithText('Confirm');
  }

  public async doNavigateTo(): Promise<void> {
    await this.page.goto(this.urlPath, { waitUntil: 'domcontentloaded' });
    // Vite dev sometimes needs more time to connect to page
    await this.page.waitForTimeout(1000);
  }

  public async doWaitForURL(): Promise<void> {
    await this.page.waitForURL(this.urlPathRegex);
  }

  public doClickNameInput(): Promise<void> {
    return this.getNameInput().click();
  }

  public doClickCodeInput(): Promise<void> {
    return this.getCodeInput().click();
  }

  public doClickConfirmButton(): Promise<void> {
    return this.getConfirmButton().click();
  }

  public doFillNameInput(text: string): Promise<void> {
    return this.getNameInput().fill(text);
  }

  public doFillCodeInput(text: string): Promise<void> {
    return this.getCodeInput().fill(text);
  }

  public async checkTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  private getInputByPlaceholder(text: string, exact?: boolean): Locator {
    if (exact) {
      return this.page.getByPlaceholder(text, { exact: true });
    }

    return this.page.getByPlaceholder(text);
  }

  private getButtonWithText(text: string): Locator {
    return this.page.getByRole('button', { name: text });
  }
}
