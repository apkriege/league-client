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
