import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { getVisibleText, type TextValidation, validateText } from './textHelper';

type SavePageOptions = {
  flowName: string;
  outputDir: string;
  seen: Set<string>;
  startUrl: URL;
  urls: string[];
  validations: TextValidation[];
};

/**
 * Prepares the output directory by removing any existing content and creating necessary subdirectories for screenshots.
 * @param outputDir The path to the output directory where results will be saved.
 */
export async function prepareOutput(outputDir: string) {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(join(outputDir, 'screenshots'), { recursive: true });
}

/**
 * Writes the crawler results to a JSON file in the specified output directory.
 * @param outputDir The path to the output directory where the results will be saved.
 * @param result An object containing the crawler results, typically a mapping of flow names to arrays of URLs.
 */
export async function writeResult(outputDir: string, result: Record<string, string[]>) {
  await writeFile(join(outputDir, 'urls-by-flow.json'), JSON.stringify(result, null, 2));
}

/**
 * Writes the text validation results to a JSON file in the specified output directory.
 * @param outputDir The path to the output directory where the results will be saved.
 * @param result An object containing the text validation results, typically a mapping of flow names to arrays of validations.
 */
export async function writeValidationResult(outputDir: string, result: unknown) {
  await writeFile(join(outputDir, 'text-validation-by-flow.json'), JSON.stringify(result, null, 2));
}

/**
 * Saves a screenshot of the current page state to the output directory, organized by flow name and indexed by the order of URLs visited.
 * The screenshot file name is generated based on the URL and the starting URL to ensure uniqueness and readability.
 * @param page The Playwright Page object representing the current page state to be captured in the screenshot.
 * @param outputDir The path to the output directory where the screenshot will be saved.
 * @param flowName The name of the flow being crawled, used to organize screenshots into subdirectories.
 * @param index The index of the current URL in the flow, used to create a unique file name for the screenshot.
 * @param url The URL of the page being captured, used to generate the file name for the screenshot.
 * @param startUrl The starting URL of the crawl, used to generate a relative file name for the screenshot based on the URL structure.
 */
export async function saveScreenshot(
  page: Page,
  outputDir: string,
  flowName: string,
  index: number,
  url: string,
  startUrl: URL,
) {
  const screenshotDir = join(outputDir, 'screenshots', flowName);
  await mkdir(screenshotDir, { recursive: true });

  await page.screenshot({
    fullPage: true,
    path: join(screenshotDir, `${index}-${fileName(url, startUrl)}.png`),
  });
}

/**
 * Saves the current page's URL and a screenshot, and performs text validation on the visible text of the page.
 * @param page The Playwright Page object representing the current page state to be saved and validated.
 * @param options An object containing options for saving the page, including flow name, output directory, seen URLs set, starting URL, arrays for URLs and validations to be updated.
 */
export async function savePage(page: Page, options: SavePageOptions) {
  const url = page.url();

  options.seen.add(url);
  options.urls.push(url);

  await saveScreenshot(page, options.outputDir, options.flowName, options.urls.length, url, options.startUrl);

  options.validations.push(validateText(url, await getVisibleText(page)));
}

/**
 * Generates a file name based on the given URL and the starting URL.
 * It creates a relative path from the starting URL, replaces non-alphanumeric characters with hyphens, and ensures the file name is in lowercase.
 * If the resulting file name is empty, it defaults to "start".
 * @param url The URL for which to generate the file name, typically the current page URL being processed.
 * @param startUrl The starting URL of the crawl, used to create a relative file name based on the URL structure.
 * @returns A string representing the generated file name for the screenshot, derived from the URL and starting URL.
 */
function fileName(url: string, startUrl: URL) {
  const nextUrl = new URL(url);

  return (
    nextUrl.pathname
      .replace(startUrl.pathname, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'start'
  );
}
