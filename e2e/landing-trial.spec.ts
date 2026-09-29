import { expect, test } from '@playwright/test';

test('home page explains the scored-event trial and paid continuation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('First 3 scored events free', { exact: true })).toBeVisible();
  await page.locator('section').first().getByRole('link', { name: 'Start your free trial' }).click();
  await expect(page).toHaveURL(/#register$/);
  await expect(page.getByText('Score 3 events free. No trial clock.')).toBeAttached();
  await expect(page.getByText('Score 3 events free; activate before the next scored event')).toBeVisible();
  await expect(page.getByText(/Every new league gets its own trial/)).toBeVisible();
});

test('@mobile trial offer and registration remain readable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('First 3 scored events free', { exact: true })).toBeVisible();
  await page.locator('section').first().getByRole('link', { name: 'Start your free trial' }).click();
  await expect(page.getByRole('button', { name: 'Create admin account' })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('registration password fields can be revealed independently', async ({ page }) => {
  await page.goto('/');
  await page.locator('section').first().getByRole('link', { name: 'Start your free trial' }).click();
  const password = page.getByLabel('Password', { exact: true });
  const confirmation = page.getByLabel('Confirm password', { exact: true });
  await password.fill('secret-password');
  await confirmation.fill('secret-password');
  await expect(password).toHaveAttribute('type', 'password');
  await expect(confirmation).toHaveAttribute('type', 'password');

  const showPassword = page.getByRole('button', { name: 'Show password', exact: true });
  await showPassword.click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(confirmation).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: 'Hide password', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Show confirm password' }).focus();
  await page.keyboard.press('Enter');
  await expect(confirmation).toHaveAttribute('type', 'text');
  await expect(confirmation).toHaveValue('secret-password');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
});
