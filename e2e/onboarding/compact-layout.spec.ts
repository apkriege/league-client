import { expect, test } from '@playwright/test';

test('onboarding additions use compact desktop and mobile layouts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('app-store', JSON.stringify({ state: { user: { id: 901, role: 'ADMIN', firstName: 'Test', lastName: 'Admin', email: 'admin@test.com', leagues: [] }, leagueId: null, playerId: null }, version: 0 })));
  const league = { id: 1, adminId: 901, name: 'Thursday League', type: 'season', format: 'individual', holeFormat: '18', startDate: '2026-01-01', endDate: '2027-01-01', players: [], teams: [], events: [], entitlement: { status: 'trialing', requiredGolfers: 8, trialEventCount: 0, trialEventLimit: 3 } };
  await page.route('http://127.0.0.1:3310/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path === '/api/admin/leagues' ? [league] : path === '/api/leagues/1' ? league : path.startsWith('/api/courses') ? [{ id: 12, name: 'Local Course', tees: [] }] : path === '/api/leagues' ? { leagues: [] } : [] });
  });
  await page.goto('/leagues/create');
  const courseCheck = page.getByRole('region', { name: 'Course availability' });
  await expect(courseCheck).toBeVisible();
  expect((await courseCheck.boundingBox())!.height).toBeLessThanOrEqual(90);
  await page.screenshot({ path: '/tmp/onboarding-compact-league-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(courseCheck).toBeVisible();
  expect((await courseCheck.boundingBox())!.width).toBeLessThanOrEqual(390);
  await page.locator('summary').filter({ hasText: 'Check your course' }).click();
  const search = page.getByRole('combobox', { name: 'Find your course' });
  await expect(search).toBeVisible();
  expect((await search.boundingBox())!.width).toBeGreaterThan(180);
  expect((await courseCheck.boundingBox())!.height).toBeLessThanOrEqual(320);
  await page.screenshot({ path: '/tmp/onboarding-compact-league-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/league/1/admin');
  const setup = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Get ready for your first round' }) });
  await expect(setup).toBeVisible();
  expect((await setup.boundingBox())!.height).toBeLessThanOrEqual(180);
  await page.screenshot({ path: '/tmp/onboarding-compact-dashboard.png', fullPage: true });
  await page.getByRole('button', { name: 'Player invitations', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Player invitations' });
  await expect(drawer).toBeVisible();
  expect((await drawer.boundingBox())!.width).toBeLessThanOrEqual(420);
  await expect.poll(async () => Math.round((await drawer.boundingBox())!.x)).toBe(860);
  await page.screenshot({ path: '/tmp/onboarding-compact-invitations.png' });
});
