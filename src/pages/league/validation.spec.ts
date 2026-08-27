import { describe, expect, it } from "vitest";
import { validateLeagueForm, validateLeagueWizardStep } from "./validation";

const validLeague = {
  name: "Thursday League",
  type: "season",
  holeFormat: "18",
  format: "individual",
  numPlayers: 8,
  contactFirstName: "Adam",
  contactLastName: "Admin",
  contactEmail: "admin@test.com",
  startDate: "2026-05-01",
  endDate: "2027-05-01",
  players: [],
  teams: [],
};

describe("league form validation", () => {
  it("does not require a public/private access setting", () => {
    expect(validateLeagueForm(validLeague)).toBeNull();
  });

  it("requires the fields used to calculate each player's Course Handicap", () => {
    expect(
      validateLeagueForm(
        {
          ...validLeague,
          players: [
            { firstName: "Ada", lastName: "Lovelace", gender: "female", handicap: 12 },
          ],
        },
        { requirePlayers: true }
      )
    ).toBeNull();
  });

  it("requires a season to span exactly one calendar year", () => {
    expect(validateLeagueForm({ ...validLeague, endDate: "2026-09-01" })).toBe(
      "A league season must cover exactly one calendar year."
    );
  });

  it("rejects a league end date beyond the one-year maximum", () => {
    expect(
      validateLeagueForm({
        ...validLeague,
        endDate: "2027-05-02",
      }),
    ).toBe("A league season must cover exactly one calendar year.");
  });

  it("rejects invalid dates before leaving league information", () => {
    expect(validateLeagueWizardStep({ ...validLeague, endDate: "not-a-date" }, "info")).toBe(
      "End date is invalid.",
    );
  });
});

describe("league wizard step validation", () => {
  it("validates league information before opening the roster step", () => {
    expect(validateLeagueWizardStep({ ...validLeague, name: "" }, "info")).toBe(
      "League name is required.",
    );
    expect(validateLeagueWizardStep(validLeague, "info")).toBeNull();
  });

  it("requires a valid player before opening the next step", () => {
    expect(validateLeagueWizardStep(validLeague, "players")).toBe("Add at least one player.");
    expect(
      validateLeagueWizardStep(
        {
          ...validLeague,
          players: [
            { firstName: "Ada", lastName: "Lovelace", gender: "female", handicap: 12 },
          ],
        },
        "players",
      ),
    ).toBeNull();
  });

  it("requires complete teams before opening review", () => {
    const teamLeague = { ...validLeague, format: "team" };
    expect(validateLeagueWizardStep(teamLeague, "teams")).toBe("Create at least one team.");
    expect(
      validateLeagueWizardStep(
        {
          ...teamLeague,
          teams: [{ name: "Blue Team", players: [1, 2] }],
        },
        "teams",
      ),
    ).toBeNull();
  });
});
