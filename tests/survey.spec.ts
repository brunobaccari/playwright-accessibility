import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function scan(page: Page, testInfo: TestInfo) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('axe-results', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  return result;
}

async function skipToForm(page: Page) {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to accessible demo page', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content (within demo page)', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'None', exact: true })).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  const response = await page.goto('after/survey.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Citylights Survey [Accessible Survey Page]');
});

test('survey inicial sem violações automáticas A/AA selecionadas', async ({ page }, testInfo) => {
  expect((await scan(page, testInfo)).violations).toEqual([]);
});

test('skip links chegam ao formulário pelo teclado', async ({ page }) => {
  await skipToForm(page);
  await expect(page).toHaveURL(/#content$/);
});

test('setas alteram apenas uma opção do grupo e Tab sai do grupo', async ({ page }) => {
  await skipToForm(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Central Park', exact: true })).toBeFocused();
  await expect(page.getByRole('radio', { name: 'Central Park', exact: true })).toBeChecked();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Grand Park', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Central Park', exact: true })).not.toBeChecked();
  await expect(page.locator('input[name="res"]:checked')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'cities of the world' })).toBeFocused();
});

test('campos nomeados seguem ordem de Tab e Shift+Tab sem perder dados', async ({ page }) => {
  await skipToForm(page);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Mr.', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toBeFocused();
  await page.keyboard.type('QA Example');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'eMail Address:', exact: true })).toBeFocused();
  await page.keyboard.type('qa@example.com');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Retype eMail:', exact: true })).toBeFocused();
  await page.keyboard.type('qa@example.com');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'submit', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('textbox', { name: 'Retype eMail:', exact: true })).toBeFocused();
  await expect(page.getByRole('textbox', { name: 'Name:', exact: true })).toHaveValue('QA Example');
  await expect(page.getByRole('textbox', { name: 'eMail Address:', exact: true })).toHaveValue('qa@example.com');
});

test('survey preenchida mantém labels e passa pelo axe', async ({ page }, testInfo) => {
  await page.getByRole('radio', { name: 'South Park', exact: true }).check();
  await page.getByRole('radio', { name: 'Mrs.', exact: true }).check();
  await page.getByRole('textbox', { name: 'Name:', exact: true }).fill('QA Example');
  await page.getByRole('textbox', { name: 'eMail Address:', exact: true }).fill('qa@example.com');
  await page.getByRole('textbox', { name: 'Retype eMail:', exact: true }).fill('qa@example.com');
  expect((await scan(page, testInfo)).violations).toEqual([]);
});

test('controle negativo: versão before expõe campos sem label', async ({ page }, testInfo) => {
  const response = await page.goto('before/survey.html');
  expect(response?.status()).toBe(200);
  const results = await scan(page, testInfo);
  const labels = results.violations.find(violation => violation.id === 'label');
  expect(labels, 'A ferramenta deve detectar o defeito conhecido, não aprovar a página before').toBeDefined();
  expect(labels?.nodes.some(node => node.target.includes('#em'))).toBe(true);
  expect(results.violations.some(violation => violation.id === 'html-has-lang')).toBe(true);
});
