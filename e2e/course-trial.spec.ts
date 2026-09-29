import { expect, test } from '@playwright/test';

const apiUrl = 'http://127.0.0.1:3310/api';

test('super admin fulfills a course request and sees a new league trial', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('super@test.com');
  await page.getByLabel('Password').fill('integration-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/leagues$/);

  const requestResponse = await page.request.post(`${apiUrl}/courses/requests/manual`, {
    multipart: { courseName: 'Browser Requested Course', city: 'Indianapolis', state: 'Indiana' },
  });
  expect(requestResponse.status()).toBe(201);
  await page.goto('/superadmin/course-requests');
  await expect(page.getByRole('heading', { name: 'Course Requests' })).toBeVisible();
  const requestsTable = page.getByRole('table');
  await expect(requestsTable.getByText('Browser Requested Course')).toBeVisible();
  await requestsTable.getByRole('combobox', { name: 'Course to fulfill Browser Requested Course' }).selectOption({ index: 1 });
  await requestsTable.getByRole('button', { name: 'Fulfill' }).click();
  await expect(requestsTable.getByText(/fulfilled · requester email/i)).toBeVisible();

  const players = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    firstName: `Browser${index + 1}`,
    lastName: 'Golfer',
    email: `browser-trial-golfer-${index + 1}@test.com`,
    gender: 'male',
    type: 'player',
    handicap: 10,
  }));
  const leagueResponse = await page.request.post(`${apiUrl}/leagues`, {
    data: {
      billingDraftKey: 'browser-trial-league-2026',
      startTrial: true,
      name: 'Browser Trial League',
      description: '',
      type: 'season',
      holeFormat: '18',
      format: 'individual',
      contactFirstName: 'Super',
      contactLastName: 'Admin',
      contactEmail: 'super@test.com',
      contactPhone: '',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      players,
      teams: [],
      scoringPeriods: [],
    },
  });
  expect(leagueResponse.status(), await leagueResponse.text()).toBe(201);
  const league = await leagueResponse.json() as { id: number };
  await page.goto(`/league/${league.id}/admin`);
  await expect(page.getByText('Free trial · 0 of 3 scored events used')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activate League' })).toBeVisible();
});
