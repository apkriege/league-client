import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const apiUrl = "http://127.0.0.1:3310/api";
const outputDirectory = path.resolve(process.cwd(), "../marketing-screenshots");
const password = "integration-test-password";

const signIn = async (page: Page) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@test.com");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/leagues$/);
};

const capture = async (page: Page, filename: string) => {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>("*").forEach((element) => {
      if (element.scrollHeight > element.clientHeight) element.scrollTop = 0;
      if (element.scrollWidth > element.clientWidth) element.scrollLeft = 0;
    });
  });
  await page.screenshot({
    path: path.join(outputDirectory, filename),
    animations: "disabled",
    fullPage: false,
  });
};

const getCompletedEventId = async (page: Page) => {
  const response = await page.request.get(`${apiUrl}/leagues/1/events`);
  expect(response.ok()).toBe(true);
  const events = (await response.json()) as Array<{ id: number; status: string }>;
  const event = events.find(({ status }) => status === "completed");
  expect(event).toBeTruthy();
  return event!.id;
};

const getScoredPlayerId = async (page: Page) => {
  const response = await page.request.get(`${apiUrl}/leagues/1/players`);
  expect(response.ok()).toBe(true);
  const players = (await response.json()) as Array<{ id: number }>;

  for (const player of players) {
    const statsResponse = await page.request.get(`${apiUrl}/leagues/1/players/${player.id}/stats`);
    if (!statsResponse.ok()) continue;
    const stats = (await statsResponse.json()) as {
      intelligence?: { sample?: { rounds?: number } };
    };
    if (Number(stats.intelligence?.sample?.rounds ?? 0) > 0) return player.id;
  }

  throw new Error("No seeded player with completed rounds was found.");
};

test.beforeAll(async () => {
  await mkdir(outputDirectory, { recursive: true });
});

test("marketing screenshots capture key desktop product views", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Run your golf league without spreadsheet chaos." }),
  ).toBeVisible();
  await capture(page, "01-landing-hero-desktop.png");

  await signIn(page);
  await page.goto("/league/1");
  await expect(page.getByRole("heading", { name: "League Pulse" })).toBeVisible();
  await capture(page, "02-league-overview-desktop.png");

  await page.goto("/league/1/admin");
  await expect(page.getByRole("heading", { name: "Operations Check" })).toBeVisible();
  await capture(page, "03-commissioner-dashboard-desktop.png");

  const eventId = await getCompletedEventId(page);
  await page.goto(`/league/1/events/${eventId}`);
  await expect(page.getByRole("heading", { name: "Event Recap" })).toBeVisible();
  await capture(page, "04-event-results-desktop.png");

  const playerId = await getScoredPlayerId(page);
  await page.goto(`/league/1/player/${playerId}`);
  await expect(page.getByRole("heading", { name: "Game Pulse" })).toBeVisible();
  await capture(page, "05-player-intelligence-desktop.png");
});

test("@mobile marketing screenshots capture the golfer experience", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);

  await page.goto("/league/1");
  await expect(page.getByRole("heading", { name: "League Pulse" })).toBeVisible();
  await capture(page, "06-league-overview-mobile.png");

  const playerId = await getScoredPlayerId(page);
  await page.goto(`/league/1/player/${playerId}`);
  await expect(page.getByRole("heading", { name: "Game Pulse" })).toBeVisible();
  await capture(page, "07-player-intelligence-mobile.png");
});
