import { expect, test, type Page } from '@playwright/test';

async function checkMetrics(page: Page, mobile: boolean) {
  await page.addInitScript(() => localStorage.setItem('app-store', JSON.stringify({ state: { user: { id: 901, role: 'ADMIN', firstName: 'Test', lastName: 'Admin', email: 'admin@test.com', leagues: [] }, leagueId: null, playerId: null }, version: 0 })));
  const league = { id: 1, adminId: 901, name: 'Thursday League', type: 'season', format: 'individual', holeFormat: '18', startDate: '2026-01-01', endDate: '2099-12-31', players: [{ id: 101, firstName: 'Pat', lastName: 'Golfer', type: 'player', gender: 'male', handicap: 12, email: '' }, { id: 102, firstName: 'Jo', lastName: 'Player', type: 'substitute', gender: 'female', handicap: 10, email: '' }], teams: [], entitlement: { status: 'trialing', requiredGolfers: 8, paidGolfers: 0, refundedGolfers: 0, trialEventLimit: 3, trialEventCount: 1 } };
  const events = [{ id: 11, name: 'Opening Round', startsAt: '2099-11-01T20:00:00Z', status: 'upcoming', type: 'regular', flights: [] }, { id: 12, name: 'Off week', startsAt: '2099-11-08T20:00:00Z', status: 'upcoming', type: 'off', flights: [] }, { id: 13, name: 'Finished Round', startsAt: '2026-01-01T20:00:00Z', status: 'completed', type: 'regular', flights: [] }, { id: 14, name: 'Canceled Round', startsAt: '2099-11-15T20:00:00Z', status: 'canceled', type: 'regular', flights: [] }];
  await page.route('http://127.0.0.1:3310/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path === '/api/admin/leagues' ? [league] : path === '/api/leagues/1' ? league : path === '/api/leagues/1/events' ? events : [] });
  });
  await page.goto('/league/1/admin');
  const intelligence = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Operations Check', exact: true }) });
  await expect(intelligence).toBeVisible();
  await expect(page.getByText(/Free trial ·/)).toHaveCount(0);
  const titleRow = page.getByRole('heading', { name: 'Thursday League', exact: true }).locator('..').locator('..');
  await expect(titleRow.getByRole('button', { name: 'Edit League', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Renew for Next Season/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Renew for Next Season', exact: true })).toHaveCount(0);
  await titleRow.screenshot({ path: `/tmp/admin-title-${mobile ? 'mobile' : 'desktop'}.png` });
  const trial = intelligence.getByText('Trial remaining', { exact: true }).locator('..');
  await expect(trial).toContainText('2');
  await expect(intelligence.getByText('scored events left', { exact: true })).toHaveCount(0);
  await expect(intelligence.getByText('completed / total', { exact: true })).toHaveCount(0);
  await expect(intelligence.getByText('players and substitutes', { exact: true })).toHaveCount(0);
  await expect(intelligence.getByText('until season end', { exact: true })).toHaveCount(0);
  await expect(trial.getByRole('button', { name: 'Activate League', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activate League', exact: true })).toHaveCount(1);
  await expect(intelligence.getByText('Events completed', { exact: true }).locator('..')).toContainText('1 / 2');
  await expect(intelligence.getByText('Total players', { exact: true }).locator('..')).toContainText('2');
  await expect(intelligence.getByText('Season remaining', { exact: true }).locator('..')).toContainText('days');
  const boxes = intelligence.locator('.grid').first().locator(':scope > div');
  await expect(boxes).toHaveCount(4);
  const first = (await boxes.nth(0).boundingBox())!;
  const third = (await boxes.nth(2).boundingBox())!;
  expect(mobile ? third.y > first.y : third.y === first.y).toBe(true);
  expect((await intelligence.boundingBox())!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await intelligence.screenshot({ path: `/tmp/commissioner-metrics-${mobile ? 'mobile' : 'desktop'}.png` });
  await expect(page.getByText('Overview', { exact: true })).toHaveCount(0);
  const communication = page.getByRole('region', { name: 'League communication' });
  const sections = communication.locator(':scope > div');
  await expect(sections).toHaveCount(2);
  await expect(sections.nth(0)).toContainText('View-only league code');
  await expect(sections.nth(1)).toContainText('Communication tools');
  await communication.screenshot({ path: `/tmp/admin-communication-${mobile ? 'mobile' : 'desktop'}.png` });
  let checkoutPayload: unknown;
  let releaseCheckout = () => {};
  await page.route('http://127.0.0.1:3310/api/payments/checkout-session', async route => {
    checkoutPayload = route.request().postDataJSON();
    await new Promise<void>(resolve => { releaseCheckout = resolve; });
    await route.fulfill({ status: 500, json: { message: 'Checkout unavailable' } });
  });
  await trial.getByRole('button', { name: 'Activate League', exact: true }).click();
  await expect(trial.getByRole('button', { name: 'Preparing Checkout...', exact: true })).toBeDisabled();
  await expect.poll(() => checkoutPayload).toMatchObject({ purpose: 'league_capacity', leagueId: 1, requestedGolfers: 8 });
  releaseCheckout();
  await expect(trial.getByRole('button', { name: 'Activate League', exact: true })).toBeEnabled();
  await expect(page).toHaveURL(/\/league\/1\/admin$/);
  await page.route('http://127.0.0.1:3310/api/leagues/1', route => route.fulfill({ json: { ...league, adminId: 999 } }));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Operations Check', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activate League', exact: true })).toHaveCount(0);
  await page.route('http://127.0.0.1:3310/api/leagues/1', route => route.fulfill({ json: { ...league, entitlement: { ...league.entitlement, status: 'paid', paidGolfers: 8 } } }));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Operations Check', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activate League', exact: true })).toHaveCount(0);
}

test('commissioner stat boxes show useful operational metrics', async ({ page }) => checkMetrics(page, false));
test('@mobile commissioner stat boxes keep the existing two-column layout', async ({ page }) => checkMetrics(page, true));
