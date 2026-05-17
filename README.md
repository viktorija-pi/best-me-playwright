# Best Me Playwright Crawler

Small Playwright crawler script for the questionnaire flow.

The script crawls the configured female and male questionnaire flows, saves one screenshot for each unique visited URL, extracts visible text, and generates a lightweight language/spelling validation report.

## Project Setup

Prerequisites:
Before running the project, make sure the following are installed:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Install Playwright browsers if they are not installed yet:

```bash
npx playwright install
```

`.env` and generated crawler output are ignored by git.

## Project structure

```text
.
├── crawler-results/
│   ├── screenshots/
│   ├── text-validation-by-flow.json
│   └── urls-by-flow.json
├── scripts/
│   └── crawler.ts
├── src/
│   └── helper/
│       ├── fileHelper.ts
│       ├── pageHelper.ts
│       └── textHelper.ts
├── .github/
├── .env
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
└── README.md
```

```text
scripts/crawler.ts — crawler entry point
src/helper/ — helper utilities for file handling, page interaction, and text validation
crawler-results/ — generated screenshots and reports
.github/ — GitHub Actions workflow configuration
```

## Environment Configuration

The crawler has a default `BASE_URL`, so it can be run without creating a `.env` file.

Optionally, create a `.env` file from `.env.example` to override the base URL:

```env
BASE_URL=https://fasting.best.me
```

## Run the crawler

```bash
npm run crawl
```

Generated files are saved in:

```text
crawler-results/
  urls-by-flow.json
  text-validation-by-flow.json
  screenshots/
    female/
    male/
```

Useful checks:

```bash
npm run lint
npm run format:check
```

Auto-format files:

```bash
npm run format
```

## CI

GitHub Actions currently runs code quality checks only:

- `npm run lint`
- `npm run format:check`

Playwright tests are not run in CI yet because this mock project is focused on the crawler script, not a finished test suite.

## Current Behavior

The crawler:

- starts from the configured questionnaire path
- crawls two flows: `female` and `male`
- keeps only unique URLs per flow
- saves screenshots for each unique URL
- extracts visible text from each visited page
- checks for simple language/spelling issues

The text validation is intentionally lightweight. It checks for likely English text, a few common spelling mistakes, repeated words, lowercase standalone `i`, and spaces before punctuation.

## Mock Project Notes

This is a simplified mock implementation focused on the assignment requirements and timeframe.

At the moment, the crawler stops when the flow reaches pages that require typed input, such as the name page. The next step would be to add simple handlers for those page types.

Possible next improvements:

- use a real spelling/grammar checker
- move flow and path config out of the script
- upload generated reports/screenshots in CI

Total time spent on task:

- Implementation, debugging, fixes, improvements, and optimization: 1h 36min
- File cleanup and preparation for merge: 19min
- Initial preparation, project setup, task review, and app exploration: 30min

Total: 1h 54min implementation time + 30min preparation time
