import { describe, expect, it } from "vitest";
import { getInvitationStatus, groupInvitationPlayers, parseInvitations, type Invitation } from "./invitationState";
const invitation: Invitation = { id: 1, token: "token", email: "pat@test.com", status: "pending", expiresAt: "2026-01-01T00:00:00Z", playerId: 1 };
describe("invitation state", () => {
  it("shows expired pending invitations as ready to invite again", () => {
    expect(getInvitationStatus(invitation, Date.parse("2026-02-01"))).toBe("expired");
    expect(groupInvitationPlayers([{ id: 1, firstName: "Pat", lastName: "Golfer", email: "PAT@test.com" }], [invitation], Date.parse("2026-02-01")).ready).toHaveLength(1);
  });
  it("distinguishes missing email, active invitations, and claimed profiles", () => {
    const players = [{ id: 1, firstName: "Pat", lastName: "Golfer", email: "PAT@test.com" }, { id: 2, firstName: "Jo", lastName: "Golfer" }, { id: 3, firstName: "Sam", lastName: "Golfer", userId: 7 }];
    const groups = groupInvitationPlayers(players, [invitation], Date.parse("2025-12-01"));
    expect(groups.ready).toHaveLength(0); expect(groups.missingEmail[0].id).toBe(2); expect(groups.claimed[0].id).toBe(3);
  });
  it("validates API invitations", () => {
    expect(parseInvitations([invitation])).toEqual([invitation]);
    expect(() => parseInvitations([null])).toThrow(); expect(() => parseInvitations({})).toThrow();
  });
});
