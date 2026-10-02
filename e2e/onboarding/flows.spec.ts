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

test('mobile roster fields fit and edit/delete have accessible touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAdmin(page);
  await page.goto('/leagues/create');
  await page.getByLabel('League Name', { exact: true }).fill('Mobile League');
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('heading', { name: 'Add Players', exact: true })).toBeVisible();
  const firstName = page.getByLabel('First Name', { exact: true });
  await firstName.fill('Mobile');
  const bounds = await firstName.boundingBox();
  expect(bounds?.width).toBeGreaterThan(200);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(390);
  await page.getByLabel('Last Name', { exact: true }).fill('Golfer');
  await page.getByLabel('18-Hole Handicap', { exact: true }).fill('12.4');
  await page.getByRole('combobox').filter({ hasText: 'Select gender' }).click();
  await page.getByRole('option', { name: 'Female', exact: true }).click();
  await page.getByRole('button', { name: 'Save Player', exact: true }).click();
  const edit = page.getByRole('button', { name: 'Edit Mobile Golfer' });
  await expect(edit).toBeVisible();
  expect((await edit.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await edit.click();
  await expect(firstName).toHaveValue('Mobile');
  await page.getByRole('button', { name: 'Delete Mobile Golfer' }).click();
  await expect(edit).toHaveCount(0);
});

test('registration sign-in keeps the invitation return path', async ({ page }) => {
  await page.goto('/?redirect=%2Finvite%2Fsample-token#register');
  await page.locator('#register').scrollIntoViewIfNeeded();
  const signIn = page.locator('#register').getByRole('link', { name: 'Sign in', exact: true });
  await expect(signIn).toHaveAttribute('href', '/login?redirect=%2Finvite%2Fsample-token');
  await signIn.click();
  await expect(page.getByRole('link', { name: 'Register', exact: true })).toHaveAttribute('href', '/?redirect=%2Finvite%2Fsample-token#register');
});

test('signup explains the password rule and switches to verification recovery', async ({ page }) => {
  let resendCount = 0;
  await page.route('http://127.0.0.1:3310/api/auth/**', async route => {
    if (route.request().url().endsWith('/resend')) resendCount += 1;
    await route.fulfill({ json: { message: resendCount ? 'Verification email sent again.' : 'Account created. Verify your email.' } });
  });
  await page.goto('/#register');
  await page.locator('#register').scrollIntoViewIfNeeded();
  const panel = page.locator('#register');
  await expect(panel.getByText('Use at least 8 characters for your password.')).toBeVisible();
  await panel.getByLabel('First name', { exact: true }).fill('New');
  await panel.getByLabel('Last name', { exact: true }).fill('Admin');
  await panel.getByLabel('Email', { exact: true }).fill('new@test.com');
  await panel.getByLabel('Password', { exact: true }).fill('safe-password');
  await panel.getByLabel('Confirm password', { exact: true }).fill('safe-password');
  await panel.getByRole('checkbox').check();
  await panel.getByRole('button', { name: 'Create admin account' }).click();
  await expect(panel.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await expect(panel.getByLabel('Password', { exact: true })).toHaveCount(0);
  await panel.getByRole('button', { name: 'Resend verification email' }).click();
  await expect(panel.getByRole('status')).toHaveText('Verification email sent again.');
  expect(resendCount).toBe(1);
  await panel.getByRole('button', { name: 'Use a different email' }).click();
  await expect(panel.getByLabel('Password', { exact: true })).toHaveValue('');
});

test('course loading errors offer retry and do not masquerade as an empty directory', async ({ page }) => {
  await mockAdmin(page);
  let failed = true;
  await page.route('http://127.0.0.1:3310/api/courses?*', route => route.fulfill(failed
    ? { status: 500, json: { message: 'Course service unavailable' } }
    : { json: [] }));
  await page.goto('/courses');
  await expect(page.getByText('Unable to load courses', { exact: true })).toBeVisible();
  await expect(page.getByText('No courses available yet', { exact: true })).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Retry loading courses' }).click();
  await expect(page.getByText('No courses available yet', { exact: true })).toBeVisible();
});

async function mockLeague(page: Page, type = 'season') {
  await mockAdmin(page);
  const league = { id: 1, adminId: 901, name: 'Test League', type, format: 'individual', holeFormat: '18',
    startDate: '2026-01-01', endDate: '2027-01-01', players: [], teams: [], events: [], entitlement: { status: 'trialing', requiredGolfers: 8, trialEventCount: 0, trialEventLimit: 3 } };
  await page.route('http://127.0.0.1:3310/api/admin/leagues', route => route.fulfill({ json: [league] }));
  await page.route('http://127.0.0.1:3310/api/leagues/1', route => route.fulfill({ json: league }));
  return league;
}

test('both event builders expose course errors and retry', async ({ page }) => {
  await mockLeague(page);
  await page.route('http://127.0.0.1:3310/api/courses?*', route => route.fulfill({ status: 500, json: { message: 'Course service unavailable' } }));
  await page.goto('/league/1/events/create');
  await expect(page.getByText('Unable to load courses', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Single Event/ }).click();
  await expect(page.getByRole('button', { name: 'Retry loading courses' })).toBeVisible();
});

test('league setup checks course availability and requests in place without losing details', async ({ page }) => {
  await mockAdmin(page);
  await page.route('http://127.0.0.1:3310/api/courses?*', route => route.fulfill({ json: [
    { id: 12, name: 'Local Course', club: { name: 'Local Club', location: 'Test City, IN' }, tees: [] },
  ] }));
  await page.goto('/leagues/create');
  await page.getByLabel('League Name', { exact: true }).fill('Course Check League');
  await page.getByRole('combobox', { name: 'Find your course' }).fill('Local');
  await page.getByRole('option', { name: /Local Course/ }).click();
  await expect(page.getByText('Course available. Continue with your league setup.')).toBeVisible();
  await page.getByRole('button', { name: 'Request a missing course' }).click();
  await expect(page.getByRole('dialog', { name: 'Request a course' })).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByLabel('League Name', { exact: true })).toHaveValue('Course Check League');
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('heading', { name: 'Add Players', exact: true })).toBeVisible();
});

test('single and series drafts survive reload and course requests preserve event data', async ({ page }) => {
  await mockLeague(page);
  await page.route('http://127.0.0.1:3310/api/courses?*', route => route.fulfill({ json: [
    { id: 12, name: 'Local Course', numHoles: 18, tees: [], club: { name: 'Local Club' } },
  ] }));
  await page.goto('/league/1/events/create');
  await page.getByLabel('Series Name', { exact: true }).fill('Restored Series');
  await page.reload();
  await expect(page.getByLabel('Series Name', { exact: true })).toHaveValue('Restored Series');
  await page.getByRole('button', { name: /Single Event/ }).click();
  await page.getByLabel('Event Name', { exact: true }).fill('Restored Event');
  await page.getByRole('button', { name: 'Request a missing course' }).click();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByLabel('Event Name', { exact: true })).toHaveValue('Restored Event');
  await page.reload();
  await expect(page.getByLabel('Event Name', { exact: true })).toHaveValue('Restored Event');
  await page.getByRole('button', { name: /Multi-Event Series/ }).click();
  await expect(page.getByLabel('Series Name', { exact: true })).toHaveValue('Restored Series');
});

test('restored flights survive mounting and successful creation clears all event drafts', async ({ page }) => {
  await mockLeague(page);
  await page.route('http://127.0.0.1:3310/api/courses?*', route => route.fulfill({ json: [
    { id: 12, name: 'Local Course', numHoles: 18, tees: [{ id: 21, name: 'White', distance: 6000, par: 72 }], club: { name: 'Local Club' } },
  ] }));
  await page.goto('/league/1/events/create');
  await page.getByRole('button', { name: /Single Event/ }).click();
  await page.getByLabel('Event Name', { exact: true }).fill('Draft With Flights');
  await page.evaluate(() => {
    const key = 'event-setup:v1:901:1';
    const draft = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...draft, courseId: '12', teeId: '21', scoringMode: 'stroke-play', flights: [[101, 102]] }));
  });
  await page.reload();
  await expect(page.getByLabel('Event Name', { exact: true })).toHaveValue('Draft With Flights');
  const storedFlights = await page.evaluate(() => JSON.parse(localStorage.getItem('event-setup:v1:901:1')!).flights);
  expect(storedFlights).toEqual([[101, 102]]);
  await page.route('http://127.0.0.1:3310/api/leagues/1/event', async route => {
    expect(route.request().postDataJSON().flights).toEqual([[101, 102]]);
    await route.fulfill({ status: 201, json: { id: 22 } });
  });
  await page.getByRole('button', { name: 'Create Event', exact: true }).click();
  await expect(page).toHaveURL(/\/league\/1\/admin$/);
  expect(await page.evaluate(() => ['event-setup:v1:901:1', 'event-setup:v1:901:1:series', 'event-setup:v1:901:1:mode'].map(key => localStorage.getItem(key)))).toEqual([null, null, null]);
});

test('roster import previews valid rows, rejects duplicates, and appends with distinct IDs', async ({ page }) => {
  await mockAdmin(page);
  await page.goto('/leagues/create');
  await page.getByLabel('League Name', { exact: true }).fill('Imported League');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'Import players', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Import players' });
  const source = 'First Name\tLast Name\tGender\tHandicap\nPat\tGolfer\tM\t12.4\nJo\tPlayer\tF\t0';
  await dialog.getByLabel('Spreadsheet rows').fill(source);
  await expect(dialog.getByRole('row', { name: 'Pat Golfer male 12.4' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Import 2 players' }).click();
  await expect(page.getByRole('button', { name: 'Edit Pat Golfer' })).toBeVisible();
  const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('create-league-draft:901')!).players.map((player: { id: number }) => player.id));
  expect(new Set(ids).size).toBe(2);
  await page.getByRole('button', { name: 'Import players', exact: true }).click();
  await dialog.getByLabel('Spreadsheet rows').fill(source);
  await expect(dialog.getByRole('alert')).toContainText('duplicate');
  await expect(dialog.getByRole('button', { name: /Import \d+ players/ })).toBeDisabled();
});

test('new admin dashboard prioritizes the first event', async ({ page }) => {
  await mockLeague(page);
  await page.goto('/league/1/admin');
  await expect(page.getByRole('heading', { name: 'Get ready for your first round' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create your first event' })).toHaveAttribute('href', '/league/1/events/create');
  await expect(page.getByRole('heading', { name: 'Operations Check' })).toHaveCount(0);
});

test('getting-started actions are hidden for archived and unpaid leagues', async ({ page }) => {
  const league = await mockLeague(page);
  await page.route('http://127.0.0.1:3310/api/leagues/1', route => route.fulfill({ json: { ...league, seasonStatus: 'archived' } }));
  await page.goto('/league/1/admin');
  await expect(page.getByText('Past season — read only', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Get ready for your first round' })).toHaveCount(0);
  await page.route('http://127.0.0.1:3310/api/leagues/1', route => route.fulfill({ json: { ...league, entitlement: null } }));
  await page.reload();
  await expect(page.getByText('Season payment needs attention', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Get ready for your first round' })).toHaveCount(0);
});

test('tournaments start with a single event and advanced scoring preserves chosen values', async ({ page }) => {
  await mockLeague(page, 'tournament');
  await page.route('http://127.0.0.1:3310/api/courses?*', route => route.fulfill({ json: [
    { id: 12, name: 'Local Course', numHoles: 18, tees: [], club: { name: 'Local Club' } },
  ] }));
  await page.goto('/league/1/events/create');
  await expect(page.getByLabel('Event Name', { exact: true })).toBeVisible();
  const points = page.getByLabel('Points per hole', { exact: true });
  await expect(points).not.toBeVisible();
  const summary = page.getByText('Advanced scoring settings', { exact: true });
  await summary.click();
  await points.fill('3');
  await summary.click();
  await expect(points).not.toBeVisible();
  await summary.click();
  await expect(points).toHaveValue('3');
  await page.reload();
  await summary.click();
  await expect(points).toHaveValue('3');
});

test('invitations explain missing email, select all ready players, and resend pending links', async ({ page }) => {
  const league = await mockLeague(page);
  await page.route('http://127.0.0.1:3310/api/leagues/1', route => route.fulfill({ json: { ...league, players: [
    { id: 1, firstName: 'Missing', lastName: 'Email' }, { id: 2, firstName: 'Ready', lastName: 'One', email: 'one@test.com' },
    { id: 3, firstName: 'Ready', lastName: 'Two', email: 'two@test.com' }, { id: 4, firstName: 'Pending', lastName: 'Player', email: 'pending@test.com' },
  ] } }));
  const invitations = [{ id: 8, token: 'pending-token', email: 'pending@test.com', playerId: 4, status: 'pending', expiresAt: '2099-01-01' }];
  const sent: Array<{ playerIds: number[]; resend?: boolean }> = [];
  await page.route('http://127.0.0.1:3310/api/leagues/1/invitations', async route => {
    if (route.request().method() === 'POST') { sent.push(route.request().postDataJSON()); await route.fulfill({ status: 201, json: { delivery: [{ result: { status: 'sent' } }] } }); }
    else await route.fulfill({ json: invitations });
  });
  await page.goto('/league/1/admin');
  await page.getByRole('button', { name: 'Player invitations', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Player invitations' });
  await expect(drawer.getByText('Missing email · 1', { exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Add player emails' })).toHaveAttribute('href', '/league/1/players');
  await drawer.getByRole('button', { name: 'Select all' }).click();
  await drawer.getByRole('button', { name: 'Send invitations', exact: true }).click();
  await expect.poll(() => sent.length).toBe(1);
  expect(sent[0].playerIds).toEqual([2, 3]);
  await drawer.getByRole('button', { name: 'Resend email' }).click();
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1]).toEqual({ playerIds: [4], resend: true });
  await expect(drawer.getByRole('button', { name: 'Resend email' })).toBeEnabled();
  await drawer.getByRole('button', { name: 'Resend email' }).focus();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Player invitations', exact: true })).toBeFocused();
});
