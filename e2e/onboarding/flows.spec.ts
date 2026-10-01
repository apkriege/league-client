import { expect, test, type Page } from '@playwright/test';

async function mockAdmin(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem('app-store')) localStorage.setItem('app-store', JSON.stringify({ state: {
      user: { id: 901, role: 'ADMIN', firstName: 'Test', lastName: 'Admin', email: 'admin@test.com', leagues: [] },
      leagueId: null, playerId: null,
    }, version: 0 }));
  });
  await page.route('http://127.0.0.1:3310/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const data = path === '/api/admin/leagues' ? []
      : path === '/api/leagues' ? { leagues: [] }
      : path.includes('/stripe') ? { billing: { trialEligible: true } }
      : [];
    await route.fulfill({ json: data });
  });
}

test('league draft survives returning through My Leagues and restores the step', async ({ page }) => {
  await mockAdmin(page);
  await page.goto('/leagues/create');
  await page.getByLabel('League Name', { exact: true }).fill('Resumable League');
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('heading', { name: 'Add Players', exact: true })).toBeVisible();
  await page.goto('/leagues');
  await page.getByRole('link', { name: /Resume League Setup/ }).click();
  await expect(page.getByRole('heading', { name: 'Add Players', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('League Name', { exact: true })).toHaveValue('Resumable League');
  await page.goto('/leagues');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Start a fresh league' }).click();
  await expect(page.getByRole('link', { name: /Resume League Setup/ })).toBeVisible();
});
