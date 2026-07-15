export function normalizeAuthUser(user: any) {
  if (!user) return null;

  const role = String(user.role || "").toUpperCase();
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";

  return {
    ...user,
    firstName,
    lastName,
    role,
    isAdmin: role === "ADMIN" || role === "SUPER",
    isSuperAdmin: role === "SUPER",
    isLeagueViewer: role === "VIEWER",
    leagues: Array.isArray(user.leagues) ? user.leagues : [],
  };
}
