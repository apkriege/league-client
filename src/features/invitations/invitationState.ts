export type Invitation = { id: number; token: string; email: string; status: string; expiresAt: string | null; playerId: number | null };
export type InvitationPlayer = { id: number; firstName: string; lastName: string; email?: string | null; userId?: number | null };

export function getInvitationStatus(invite: Invitation, now = Date.now()) {
  return invite.status === "pending" && invite.expiresAt && Date.parse(invite.expiresAt) <= now ? "expired" : invite.status;
}
export function groupInvitationPlayers(players: InvitationPlayer[], invitations: Invitation[], now = Date.now()) {
  const pending = new Set(invitations.filter(invite => getInvitationStatus(invite, now) === "pending").map(invite => invite.email.trim().toLowerCase()));
  return {
    missingEmail: players.filter(player => !player.userId && !player.email?.trim()),
    ready: players.filter(player => !player.userId && player.email?.trim() && !pending.has(player.email.trim().toLowerCase())),
    claimed: players.filter(player => Boolean(player.userId)),
  };
}

export function parseInvitations(value: unknown): Invitation[] {
  if (!Array.isArray(value)) throw new Error("Unable to read invitation details.");
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object" || !("id" in item) || typeof item.id !== "number" ||
      !("token" in item) || typeof item.token !== "string" || !("email" in item) || typeof item.email !== "string" ||
      !("status" in item) || typeof item.status !== "string") throw new Error("Unable to read invitation details.");
    return {
      id: item.id, token: item.token, email: item.email, status: item.status,
      expiresAt: "expiresAt" in item && typeof item.expiresAt === "string" ? item.expiresAt : null,
      playerId: "playerId" in item && typeof item.playerId === "number" ? item.playerId : null,
    };
  });
}
