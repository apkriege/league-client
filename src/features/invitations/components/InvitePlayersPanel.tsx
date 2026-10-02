import { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router";
import { DrawerActionPanel } from "@/components/league/DrawerActionPanel";
import { useLeagueInvitations } from "@api/operations/queries";
import { useCreateLeagueInvitations, useRevokeLeagueInvitation } from "@api/operations/mutations";
import { useToast } from "@/context/useToast";
import { getInvitationStatus, groupInvitationPlayers, type InvitationPlayer } from "../invitationState";

export default function InvitePlayersPanel({ leagueId, players }: { leagueId: number; players: InvitationPlayer[] }) {
  const query = useLeagueInvitations(leagueId);
  const invitations = query.data ?? [];
  const create = useCreateLeagueInvitations(leagueId);
  const revoke = useRevokeLeagueInvitation(leagueId);
  const { show } = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const groups = groupInvitationPlayers(players, invitations);
  const selectedIds = groups.ready.filter(player => selected.includes(player.id)).map(player => player.id);
  const busy = create.isPending || revoke.isPending;
  const send = (playerIds: number[], resend = false) => create.mutate({ playerIds, resend }, { onSuccess: result => {
    setSelected([]);
    const failures = result.delivery.filter(item => item.result.status !== "sent").length;
    show(failures ? `${failures} invitation emails could not be sent. Share the invitation links below.` : "Invitation email sent.", failures ? "warning" : "success");
  } });

  return <DrawerActionPanel title="Player invitations" description="Connect golfers to their player profiles." icon={<Mail size={15} />}>
    {query.isLoading && <p role="status" className="text-sm text-slate-500">Loading invitations…</p>}
    {query.isError && <div role="alert" className="space-y-3 text-sm text-red-700"><p>Unable to load invitations.</p><button type="button" onClick={() => void query.refetch()} className="min-h-11 font-bold underline">Retry invitations</button></div>}
    {!query.isLoading && !query.isError && <div className="space-y-5">
      {groups.missingEmail.length > 0 && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Missing email · {groups.missingEmail.length}</p><p className="mt-2">{groups.missingEmail.map(player => `${player.firstName} ${player.lastName}`).join(", ")}</p><Link to={`/league/${leagueId}/players`} className="mt-3 inline-block font-bold underline">Add player emails</Link></div>}
      <section><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-bold text-slate-900">Ready to invite · {groups.ready.length}</h4>{groups.ready.length > 0 && <button type="button" disabled={busy} className="min-h-11 text-sm font-bold underline" onClick={() => setSelected(selectedIds.length === groups.ready.length ? [] : groups.ready.map(player => player.id))}>{selectedIds.length === groups.ready.length ? "Clear selection" : "Select all"}</button>}</div>
        {groups.ready.length === 0 && <p className="text-sm text-slate-500">No players are ready for a new invitation. Review missing emails and pending invitations.</p>}
        <div className="max-h-64 overflow-auto">{groups.ready.map(player => <label key={player.id} className="flex min-h-11 items-center gap-3 border-b border-slate-100 py-3 text-sm"><input type="checkbox" disabled={busy} checked={selectedIds.includes(player.id)} onChange={() => setSelected(previous => previous.includes(player.id) ? previous.filter(id => id !== player.id) : [...previous, player.id])} /><span className="min-w-0"><span className="block font-bold text-slate-700">{player.firstName} {player.lastName}</span><span className="block break-all text-slate-500">{player.email}</span></span></label>)}</div>
        <button type="button" disabled={busy || !selectedIds.length} onClick={() => send(selectedIds)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{create.isPending ? "Sending invitations…" : "Send invitations"}</button>
      </section>
      <p className="text-sm text-slate-500">Claimed player profiles · {groups.claimed.length}</p>
      {invitations.length > 0 && <section><h4 className="mb-3 text-sm font-bold text-slate-900">Invitations · {invitations.length}</h4><div className="max-h-80 overflow-auto divide-y divide-slate-100">{invitations.map(invite => {
        const status = getInvitationStatus(invite);
        const player = players.find(candidate => candidate.id === invite.playerId);
        return <div key={invite.id} className="space-y-2 py-3 text-sm"><p className="break-all font-bold text-slate-700">{invite.email}</p><p className="capitalize text-slate-500">{status}</p><div className="flex flex-wrap gap-4">
          {status === "pending" && <Link to={`/invite/${invite.token}`} target="_blank" rel="noopener noreferrer" className="font-bold underline">Open invitation link</Link>}
          {["pending", "expired"].includes(status) && player && !player.userId && <button type="button" disabled={busy} onClick={() => send([player.id], true)} className="min-h-11 font-bold underline disabled:opacity-50">{status === "expired" ? "Send new invitation" : "Resend email"}</button>}
          {status === "pending" && <button type="button" disabled={busy} onClick={() => revoke.mutate(invite.id)} className="min-h-11 font-bold text-red-700 underline disabled:opacity-50">Revoke</button>}
        </div></div>;
      })}</div></section>}
    </div>}
  </DrawerActionPanel>;
}
