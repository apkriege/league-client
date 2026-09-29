import { expect, test } from '@playwright/test';

test('a regular admin can open two newly created trial leagues', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('integration-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/leagues$/);

  const createdLeagueIds = new Set<string>();
  for (const leagueName of ['First Admin Trial League', 'Second Admin Trial League']) {
    await page.goto('/leagues/create');
    await page.getByLabel('League Name').fill(leagueName);
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.getByRole('heading', { name: 'Add Players' })).toBeVisible();

    await page.getByLabel('First Name').fill('Trial');
    await page.getByLabel('Last Name').fill('Golfer');
    await page.getByLabel('18-Hole Handicap').fill('12');
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('button', { name: 'Save Player' }).click();
    await page.getByRole('button', { name: 'Next →' }).click();

    await page.getByRole('button', { name: 'Start 3-Event Trial' }).click();
    await expect(page).toHaveURL(/\/league\/\d+\/admin$/);
    createdLeagueIds.add(page.url().match(/\/league\/(\d+)\/admin$/)?.[1] ?? '');
    await expect(page.getByText('Free trial · 0 of 3 scored events used')).toBeVisible();
    await expect(page.getByText('You must be an admin of this league')).toHaveCount(0);
  }
  expect(createdLeagueIds.size).toBe(2);
});
