import type { AdminUser } from "@api/admin/types";

export type AdminUserListItem = AdminUser & {
  displayName: string;
  roleLabel: string;
  verificationLabel: "Verified" | "Pending";
};

export const formatAdminUserRole = (role: string) => {
  switch (role.toUpperCase()) {
    case "SUPER":
      return "Super Admin";
    case "ADMIN":
      return "League Admin";
    default:
      return "User";
  }
};

export const toAdminUserListItem = (user: AdminUser): AdminUserListItem => ({
  ...user,
  displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
  roleLabel: formatAdminUserRole(user.role),
  verificationLabel: user.emailVerifiedAt ? "Verified" : "Pending",
});

export const summarizeAdminUsers = (users: AdminUser[]) => ({
  total: users.length,
  superAdmins: users.filter((user) => user.role.toUpperCase() === "SUPER").length,
  leagueAdmins: users.filter((user) => user.role.toUpperCase() === "ADMIN").length,
  pendingVerification: users.filter((user) => !user.emailVerifiedAt).length,
});
