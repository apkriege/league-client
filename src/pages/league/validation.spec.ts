import { describe, expect, it } from "vitest";
import { validateLeagueForm } from "./validation";

const validLeague = {
  name: "Thursday League",
  type: "season",
  format: "individual",
  numPlayers: 8,
  contactFirstName: "Adam",
  contactLastName: "Admin",
  contactEmail: "admin@test.com",
  startDate: "2026-05-01",
  endDate: "2026-09-01",
  players: [],
  teams: [],
};

describe("league form validation", () => {
  it("does not require a public/private access setting", () => {
    expect(validateLeagueForm(validLeague)).toBeNull();
  });
});
