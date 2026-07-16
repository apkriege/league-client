import { expect, test, type Page } from '@playwright/test';

const apiUrl = 'http://127.0.0.1:3310/api';
const password = 'integration-test-password';

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/leagues$/);
}

test('public landing and login pages expose the primary entry points', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Run league night like a professional operation.' }),
  ).toBeVisible();
  await expect(page.getByText('League Night', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: /sign in/i }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
});

test('invalid credentials show the API error without leaving the login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Invalid credentials').first()).toBeVisible();
});

test('league-code viewers can read the seeded league but cannot see admin controls', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('View-only access code').fill('testcode');
  await page.getByRole('button', { name: 'Open league' }).click();

  await expect(page).toHaveURL(/\/league\/\d+$/);
  await expect(page.getByText('Seeded Thursday Night League').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);
});

test('regular members can open their league and are blocked from its admin page', async ({ page }) => {
  await signIn(page, 'user@test.com');
  await page.getByText('Seeded Thursday Night League', { exact: true }).click();
  await expect(page).toHaveURL(/\/league\/\d+$/);
  const leagueId = page.url().match(/\/league\/(\d+)/)?.[1];
  expect(leagueId).toBeTruthy();

  await page.goto(`/league/${leagueId}/admin`);
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
});

test('admins can navigate league operations and use scorecard player controls', async ({ page }) => {
  await signIn(page, 'admin@test.com');
  await expect(page.getByText('Seeded Thursday Night League', { exact: true })).toBeVisible();

  const eventsResponse = await page.request.get(`${apiUrl}/leagues/1/events`);
  expect(eventsResponse.ok()).toBe(true);
  const events = await eventsResponse.json();
  const activeEvent = events.find((event: { status: string }) => event.status === 'active');
  expect(activeEvent).toBeTruthy();

  await page.goto(`/league/1/events/${activeEvent.id}/print-scorecards`);
  await expect(page.getByRole('heading', { name: 'Flight Scorecards' })).toBeVisible();
  const firstPlayerCell = page.locator('.scorecard-player-cell').nth(1);
  await expect(firstPlayerCell.getByRole('button', { name: 'Swap' })).toBeVisible();
  await firstPlayerCell.getByRole('button', { name: 'Swap' }).click();
  await expect(firstPlayerCell.getByRole('combobox')).toBeVisible();
  await firstPlayerCell.getByRole('button', { name: 'Cancel' }).click();
  await expect(firstPlayerCell.getByRole('button', { name: 'Swap' })).toBeVisible();
});

test('sign out clears browser and server authentication', async ({ page }) => {
  await signIn(page, 'admin@test.com');
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/login$/);
  const response = await page.request.get(`${apiUrl}/auth/me`);
  expect(response.status()).toBe(401);
  await page.goto('/leagues');
  await expect(page).toHaveURL(/\/login$/);
});

test('@mobile login remains usable on a phone viewport', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeInViewport();
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/leagues$/);
  await expect(page.getByRole('heading', { name: 'My Leagues' })).toBeVisible();
});
