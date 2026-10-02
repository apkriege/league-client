import { expect, test, type Page } from '@playwright/test';

async function checkMetrics(page: Page, mobile: boolean) {
  await page.addInitScript(() => localStorage.setItem('app-store', JSON.stringify({ state: { user: { id: 901, role: 'ADMIN', firstName: 'Test', lastName: 'Admin', email: 'admin@test.com', leagues: [] }, leagueId: null, playerId: null }, version: 0 })));
  const league = { id: 1, adminId: 901, name: 'Thursday League', type: 'season', format: 'individual', holeFormat: '18', startDate: '2026-01-01', endDate: '2099-12-31', players: [], teams: [], entitlement: { status: 'trialing', requiredGolfers: 8, paidGolfers: 0, refundedGolfers: 0, trialEventLimit: 3, trialEventCount: 1 } };
  const events = [{ id: 11, name: 'Opening Round', startsAt: '2099-11-01T20:00:00Z', status: 'upcoming', type: 'regular', flights: [] }, { id: 12, name: 'Off week', startsAt: '2099-11-08T20:00:00Z', status: 'upcoming', type: 'off', flights: [] }];
  await page.route('http://127.0.0.1:3310/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path === '/api/admin/leagues' ? [league] : path === '/api/leagues/1' ? league : path === '/api/leagues/1/events' ? events : [] });
  });
  await page.goto('/league/1/admin');
  const intelligence = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Operations Check', exact: true }) });
  await expect(intelligence).toBeVisible();
  const trial = intelligence.getByText('Trial remaining', { exact: true }).locator('..');
  await expect(trial).toContainText('2');
  await expect(trial).toContainText('scored events left');
  await expect(intelligence.getByText('Events remaining', { exact: true }).locator('..')).toContainText('1');
  await expect(intelligence.getByText('Next event', { exact: true }).locator('..')).toContainText('Opening Round');
  await expect(intelligence.getByText('Season remaining', { exact: true }).locator('..')).toContainText('days');
  const boxes = intelligence.locator('.grid').first().locator(':scope > div');
  await expect(boxes).toHaveCount(4);
  const first = (await boxes.nth(0).boundingBox())!;
  const third = (await boxes.nth(2).boundingBox())!;
  expect(mobile ? third.y > first.y : third.y === first.y).toBe(true);
  expect((await intelligence.boundingBox())!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await intelligence.screenshot({ path: `/tmp/commissioner-metrics-${mobile ? 'mobile' : 'desktop'}.png` });
}

test('commissioner stat boxes show useful operational metrics', async ({ page }) => checkMetrics(page, false));
test('@mobile commissioner stat boxes keep the existing two-column layout', async ({ page }) => checkMetrics(page, true));
