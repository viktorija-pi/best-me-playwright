import 'dotenv/config';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { prepareOutput, savePage, writeResult, writeValidationResult } from '../src/helper/fileHelper';
import { goNext, selectFlow } from '../src/helper/pageHelper';
import type { TextValidation } from '../src/helper/textHelper';

type Flow = {
  name: string;
  trigger: string;
};

type CrawlerResult = Record<string, string[]>;
type ValidationResult = Record<string, TextValidation[]>;

const baseUrl = process.env.BASE_URL ?? 'https://fasting.best.me';
const crawlerPath = '/ae-en/automatic-qa-test-pipe-13-may-ph/';
const startUrl = new URL(crawlerPath, baseUrl);
const outputDir = path.resolve('crawler-results');
const maxPagesPerFlow = 40;

const flows: Flow[] = [
  { name: 'female', trigger: 'Female' },
  { name: 'male', trigger: 'Male' },
];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Main function to run the crawler.
 * It iterates through defined flows, navigates through the pages, collects URLs and text validations, and saves the results to the output directory.
 */
async function main() {
  await prepareOutput(outputDir);

  const browser = await chromium.launch({ headless: true });
  const result: CrawlerResult = {};
  const validationResult: ValidationResult = {};

  try {
    for (const flow of flows) {
      const page = await browser.newPage();
      const urls: string[] = [];
      const seen = new Set<string>();
      const validations: TextValidation[] = [];
      const saveOptions = { flowName: flow.name, outputDir, seen, startUrl, urls, validations };

      await page.goto(startUrl.href, { waitUntil: 'domcontentloaded' });
      await savePage(page, saveOptions);
      await selectFlow(page, flow.trigger);

      while (
        urls.length < maxPagesPerFlow &&
        new URL(page.url()).origin === startUrl.origin &&
        new URL(page.url()).pathname.startsWith(startUrl.pathname)
      ) {
        const url = page.url();

        if (!seen.has(url)) {
          await savePage(page, saveOptions);
        }

        if (!(await goNext(page, seen))) break;
      }

      result[flow.name] = urls;
      validationResult[flow.name] = validations;
      await page.close();
    }

    await writeResult(outputDir, result);
    await writeValidationResult(outputDir, validationResult);
  } finally {
    await browser.close();
  }

  console.log(`Saved output to ${outputDir}`);
}
