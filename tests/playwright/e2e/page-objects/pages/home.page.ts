import { expect, type Locator, type Page } from '@playwright/test';
import { NavigationBarComponent } from '../components/navigation-bar.component';

export class HomePage {
  public urlPath = '/';
  public urlPathRegex = RegExp(`${this.urlPath}[^/]*`);

  public componentNavigationBar: NavigationBarComponent;

  constructor(public page: Page) {
    this.componentNavigationBar = new NavigationBarComponent(page);
  }

  public getTitle(): Promise<string> {
    return this.page.title();
  }

  public getAuthorFilterDropdown(): Locator {
    return this.page.getByTestId('filter-dropdown');
  }

  public getCreationDateSortingDropdown(): Locator {
    return this.page.getByTestId('sorting-dropdown');
  }

  public getPreviousPageButton(): Locator {
    return this.page.getByTestId('previous-button');
  }

  public getNextPageButton(): Locator {
    return this.page.getByTestId('next-button');
  }

  public async doNavigateTo(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    // Vite dev sometimes needs more time to connect to page
    await this.page.waitForTimeout(1000);
  }

  public async doWaitForURL(): Promise<void> {
    await this.page.waitForURL(this.urlPathRegex);
  }

  public async doSelectAuthorFilterDropdownOption(
    value: '' | 'author',
  ): Promise<string[]> {
    return this.getAuthorFilterDropdown().selectOption(value);
  }

  public async doSelectCreationDateSortingDropdownOption(
    value: 'asc' | 'desc',
  ): Promise<string[]> {
    return this.getCreationDateSortingDropdown().selectOption(value);
  }

  public async doClickPreviousPageButton(): Promise<void> {
    await this.getPreviousPageButton().click();
  }

  public async doClickNextPageButton(): Promise<void> {
    await this.getNextPageButton().click();
  }

  public async checkTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  public async checkTextVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: true })).toBeVisible();
  }

  public async checkTextHidden(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: true })).toBeHidden();
  }
}
