import { describe, expect, it } from "vitest";
import type { AdminUser } from "@api/admin/types";
import { formatAdminUserRole, summarizeAdminUsers, toAdminUserListItem } from "./adminUsers";

const user = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  username: null,
  role: "ADMIN",
  phone: null,
  emailVerifiedAt: "2026-08-27T00:00:00.000Z",
  managedLeagueCount: 2,
  playerProfileCount: 1,
  createdAt: "2026-08-27T00:00:00.000Z",
  updatedAt: "2026-08-27T00:00:00.000Z",
  ...overrides,
});

describe("admin user directory modeling", () => {
  it("formats account roles for display", () => {
    expect(formatAdminUserRole("SUPER")).toBe("Super Admin");
    expect(formatAdminUserRole("ADMIN")).toBe("League Admin");
    expect(formatAdminUserRole("USER")).toBe("User");
  });

  it("builds searchable display fields", () => {
    expect(toAdminUserListItem(user())).toMatchObject({
      displayName: "Ada Lovelace",
      roleLabel: "League Admin",
      verificationLabel: "Verified",
    });
  });

  it("summarizes roles and pending verification", () => {
    expect(
      summarizeAdminUsers([
        user({ role: "SUPER" }),
        user({ id: 2, role: "ADMIN" }),
        user({ id: 3, role: "USER", emailVerifiedAt: null }),
      ]),
    ).toEqual({ total: 3, superAdmins: 1, leagueAdmins: 1, pendingVerification: 1 });
  });
});
