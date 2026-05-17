import type { Page } from '@playwright/test';

const answerSelector = 'button, [role="button"], label, input, a[href], .option';

/**
 * Attempts to navigate to the next page by first trying to click a "Continue" button, and if that fails, iterating through potential answer elements on the page.
 * It checks for visibility and enabled state of the elements before interacting with them, and waits for the page to load after each interaction. 
 * The function returns true if a navigation to a new page occurs, and false if no further navigation is possible.
 * @param page The Playwright Page object representing the current page state to be navigated.
 * @param seen A Set of strings representing URLs that have already been visited, used to avoid navigating to the same page multiple times.
 * @returns A boolean indicating whether navigation to a new page was successful.
 */
export async function goNext(page: Page, seen: Set<string>) {
  const before = page.url();

  if (await clickContinue(page)) return true;

  const answers = page.locator(answerSelector);
  const count = await answers.count();

  for (let index = 0; index < count; index += 1) {
    const answer = answers.nth(index);

    if (!(await isAnswer(answer))) continue;

    await answer.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(300);

    if (await clickContinue(page)) return true;
    if (page.url() !== before && !seen.has(page.url())) return true;
  }

  return false;
}

/**
 * Selects a flow on the page by clicking on an element that matches the provided text.
 * It waits for the page to load after the click action, and includes a timeout to ensure that the function does not hang indefinitely if the page does not load as expected.
 * @param page The Playwright Page object representing the current page state where the flow selection will occur.
 * @param text The exact text of the element to be clicked in order to select the flow, typically a button or link that triggers the flow selection.
 */
export async function selectFlow(page: Page, text: string) {
  await page.getByText(text, { exact: true }).first().click();

  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(300);
}

/**
 * Attempts to click a "Continue" button on the page, and waits for the page to load after the click action.
 * @param page The Playwright Page object representing the current page state where the "Continue" button is expected to be found and clicked.
 * @returns A boolean indicating whether the "Continue" button was found, enabled, and clicked successfully.
 */
async function clickContinue(page: Page) {
  const button = page.locator('button, [role="button"]').filter({ hasText: 'Continue' }).first();

  if (!(await button.count()) || !(await button.isEnabled())) return false;

  await button.click();
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(300);

  return true;
}

/**
 * Determines whether a given locator corresponds to an actionable answer element on the page by checking its text content, visibility, and enabled state.
 * It filters out elements that are likely not relevant for navigation (e.g., empty buttons, "Back" buttons) and ensures that the element is interactable before considering it as a valid answer.
 * @param locator The Playwright Locator object representing the element to be evaluated as a potential answer.
 * @returns A boolean indicating whether the locator corresponds to a valid answer element that can be interacted with to potentially navigate to the next page.
 */
async function isAnswer(locator: ReturnType<Page['locator']>) {
  const text = await locator.textContent().catch(() => '');
  const cleanText = text?.trim() || '';

  if (['', 'Back', 'Continue'].includes(cleanText)) return false;
  if (!(await locator.isVisible().catch(() => false))) return false;
  if (!(await locator.isEnabled().catch(() => false))) return false;

  return true;
}
