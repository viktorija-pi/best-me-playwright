import type { Page } from '@playwright/test';

const englishWords = ['a', 'and', 'are', 'for', 'is', 'of', 'the', 'to', 'what', 'you', 'your'];

const commonMistakes = ['ender', 'recieve', 'seperate', 'definately', 'teh', 'adress', 'untill', 'wich'];

export type TextValidation = {
  isLikelyEnglish: boolean;
  issuesCount: number;
  issues: string[];
  text: string;
  url: string;
};

export async function getVisibleText(page: Page) {
  return page
    .locator('body')
    .innerText()
    .then((text) => text.replace(/\s+/g, ' ').trim());
}

/**
 * Performs various checks on the provided text to validate its quality and likelihood of being English.
 * @param url The URL of the page containing the text.
 * @param text The text to be validated.
 * @returns A TextValidation object containing the results of the validation checks.
 */
export function validateText(url: string, text: string): TextValidation {
  const lowerText = text.toLowerCase();
  const words = lowerText.match(/[a-z]+/g) ?? [];
  const englishMatches = words.filter((word) => englishWords.includes(word)).length;
  const issues: string[] = [];

  if (words.length > 20 && englishMatches / words.length < 0.08) {
    issues.push('Text does not look like English.');
  }

  for (const mistake of commonMistakes) {
    if (lowerText.includes(mistake)) issues.push(`Possible spelling issue: "${mistake}".`);
  }

  const repeatedWord = text.match(/\b(\w+)\s+\1\b/i)?.[0];
  const lowercaseI = text.match(/\bi\b/)?.[0];
  const spaceBeforePunctuation = text.match(/\s+[,.!?]/)?.[0];

  if (repeatedWord) issues.push(`Repeated word found: "${repeatedWord}".`);
  if (lowercaseI) issues.push(`Lowercase "i" found: "${lowercaseI}".`);
  if (spaceBeforePunctuation) {
    issues.push(`Space before punctuation found: "${spaceBeforePunctuation}".`);
  }

  return {
    url,
    issuesCount: issues.length,
    issues,
    isLikelyEnglish: !issues.includes('Text does not look like English.'),
    text,
  };
}
