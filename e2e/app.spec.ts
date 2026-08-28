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

async function findScoredPlayerId(page: Page) {
  const playersResponse = await page.request.get(`${apiUrl}/leagues/1/players`);
  expect(playersResponse.ok()).toBe(true);
  const players = (await playersResponse.json()) as Array<{ id: number }>;

  for (const player of players) {
    const statsResponse = await page.request.get(`${apiUrl}/leagues/1/players/${player.id}/stats`);
    if (!statsResponse.ok()) continue;
    const body = await statsResponse.json() as { intelligence?: { sample?: { rounds?: number } } };
    if (Number(body.intelligence?.sample?.rounds || 0) > 0) return player.id;
  }

  throw new Error('The seeded league does not contain a player with completed rounds.');
}

test('public landing and login pages expose the primary entry points', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Golf League Management Software | League Night Pro');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://leaguenightpro.com/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
  await expect(
    page.getByRole('heading', { name: 'Run the league. Score the rounds. Understand the results.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Intelligence', exact: true }).click();
  await expect(page.getByRole('heading', {
    name: 'Your scores should explain the league—not just fill a table.',
  })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Commissioner Operations Check' })).toBeVisible();
  await expect(page.getByText('League Night', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: /sign in/i }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test('super admins can search the protected user directory', async ({ page }) => {
  await signIn(page, 'super@test.com');
  await page.getByRole('link', { name: 'Users', exact: true }).click();

  await expect(page).toHaveURL(/\/superadmin\/users$/);
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByText('admin@test.com')).toBeVisible();
  await page.getByPlaceholder('Search by name, email, role, or status...').fill('super@test.com');
  await expect(page.getByText('super@test.com')).toBeVisible();
  await expect(page.getByText('admin@test.com')).toHaveCount(0);
});

test('invalid credentials show the API error without leaving the login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Invalid credentials').first()).toBeVisible();
});

test('users can request a password reset from the login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
  await page.getByLabel('Email').fill('missing-account@test.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText(/if an account exists/i)).toBeVisible();
});

test('league-code viewers can read the seeded league but cannot see admin controls', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('View-only access code').fill('testcode');
  await page.getByRole('button', { name: 'Open league' }).click();

  await expect(page).toHaveURL(/\/league\/\d+$/);
  await expect(page.getByText('Seeded Thursday Night League').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'League Pulse' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);
});

test('regular members can open their league and are blocked from its admin page', async ({ page }) => {
  await signIn(page, 'user@test.com');
  await page.getByText('Seeded Thursday Night League', { exact: true }).click();
  await expect(page).toHaveURL(/\/league\/\d+$/);
  await expect(page.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);
  const leagueId = page.url().match(/\/league\/(\d+)/)?.[1];
  expect(leagueId).toBeTruthy();

  await page.goto(`/league/${leagueId}/admin`);
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
});

test('admins can navigate league operations and use scorecard player controls', async ({ page }) => {
  await signIn(page, 'admin@test.com');
  await expect(page.getByText('Seeded Thursday Night League', { exact: true })).toBeVisible();

  await page.goto('/league/1/admin');
  await expect(page.getByRole('heading', { name: 'Operations Check' })).toBeVisible();

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

test('completed events expose sortable points, low-gross, and low-net leaderboards', async ({
  page,
}) => {
  await signIn(page, 'admin@test.com');
  const eventsResponse = await page.request.get(`${apiUrl}/leagues/1/events`);
  expect(eventsResponse.ok()).toBe(true);
  const events = await eventsResponse.json();
  const completedEvent = events.find((event: { status: string }) => event.status === 'completed');
  expect(completedEvent).toBeTruthy();

  await page.goto(`/league/1/events/${completedEvent.id}`);
  await expect(page.getByRole('heading', { name: 'Event Recap' })).toBeVisible();
  const points = page.getByRole('button', { name: 'Points', exact: true });
  const lowGross = page.getByRole('button', { name: 'Low Gross', exact: true });
  const lowNet = page.getByRole('button', { name: 'Low Net', exact: true });
  await expect(points).toBeVisible();
  await expect(lowGross).toBeVisible();
  await expect(lowNet).toBeVisible();
  await lowGross.click();
  await expect(lowGross).toHaveAttribute('aria-pressed', 'true');
  await lowNet.click();
  await expect(lowNet).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Scorecards', exact: true }).click();
  const scorecardsDrawer = page.locator('aside.app-slideout-drawer');
  await expect(scorecardsDrawer).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Detailed Scorecards' })).toBeVisible();
  const scorecardsBackdrop = page.getByRole('button', { name: 'Close scorecards drawer' });
  await expect
    .poll(() => scorecardsBackdrop.evaluate((element) => getComputedStyle(element).backdropFilter))
    .toBe('none');
  await scorecardsDrawer.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  await expect(scorecardsDrawer.locator('table').last()).toBeVisible();
});

test('team pages turn completed results into team intelligence', async ({ page }) => {
  await signIn(page, 'admin@test.com');
  const teamsResponse = await page.request.get(`${apiUrl}/leagues/1/teams`);
  expect(teamsResponse.ok()).toBe(true);
  const teams = await teamsResponse.json() as Array<{ id: number }>;
  expect(teams.length).toBeGreaterThan(0);

  await page.goto(`/league/1/team/${teams[0].id}`);
  await expect(page.getByRole('heading', { name: 'Team DNA' })).toBeVisible();
  await expect(page.getByText('Primary rivalry')).toBeVisible();
});

test('player intelligence turns scoring history into improvement and matchup views', async ({ page }) => {
  await signIn(page, 'admin@test.com');
  const scoredPlayerId = await findScoredPlayerId(page);
  await page.goto(`/league/1/player/${scoredPlayerId}`);
  await expect(page.getByRole('heading', { name: 'Game Pulse' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Where to improve/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Scoring fingerprint' })).toBeVisible();

  await page.getByRole('tab', { name: /How you compete/ }).click();
  await expect(page.getByRole('heading', { name: 'League position' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Head-to-head' })).toBeVisible();

  await page.getByRole('tab', { name: /How you're progressing/ }).click();
  await expect(page.getByRole('heading', { name: 'Form line' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Personal records' })).toBeVisible();
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

test('@mobile player intelligence stays navigable without horizontal page overflow', async ({ page }) => {
  await signIn(page, 'admin@test.com');
  const scoredPlayerId = await findScoredPlayerId(page);
  await page.goto(`/league/1/player/${scoredPlayerId}`);

  await expect(page.getByRole('heading', { name: 'Game Pulse' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
  await page.getByRole('tab', { name: 'Compete' }).click();
  await expect(page.getByRole('heading', { name: 'Head-to-head' })).toBeVisible();
  await page.getByRole('tab', { name: 'Progress' }).click();
  await expect(page.getByRole('heading', { name: 'Form line' })).toBeVisible();
});
