import {
  useLeagueAuditLogs,
  useLeagueInvitations,
} from "@api/operations/queries";
import {
  useCreateLeagueInvitations,
  useRevokeLeagueInvitation,
} from "@api/operations/mutations";
import dayjs from "dayjs";
import { Mail, ShieldCheck, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import SectionKicker from "@/components/layout/SectionKicker";
import MuiCheckbox from "@mui/material/Checkbox";
import { useToast } from "@/context/useToast";

export function DrawerActionPanel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsMounted(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  const closeDrawer = () => {
    setIsOpen(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      closeTimerRef.current = null;
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="group inline-flex h-9 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
      >
        <span className="text-blue-700 transition group-hover:text-blue-800">
          {icon}
        </span>
        {title}
      </button>

      {isMounted && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={`Close ${title} drawer`}
            onClick={closeDrawer}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <SectionKicker>
                  League admin
                </SectionKicker>
                <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg border border-transparent p-2 text-gray-400 transition-colors hover:border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">{children}</div>
          </aside>
        </div>
      )}
    </>
  );
}

export function InvitePlayersPanel({
  leagueId,
  players,
}: {
  leagueId: number;
  players: any[];
}) {
  const { data: invitations = [] } = useLeagueInvitations(leagueId);
  const createInvites = useCreateLeagueInvitations(leagueId);
  const revokeInvite = useRevokeLeagueInvitation(leagueId);
  const { show } = useToast();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);

  const pendingEmails = new Set(
    invitations
      .filter((invite: any) => invite.status === "pending")
      .map((invite: any) => String(invite.email || "").toLowerCase())
  );
  const unclaimedPlayers = players.filter(
    (player: any) =>
      !player.userId &&
      Boolean(String(player.email || "").trim()) &&
      !pendingEmails.has(String(player.email || "").toLowerCase())
  );

  const togglePlayer = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const submit = () => {
    createInvites.mutate(
      {
        playerIds: selectedPlayerIds,
      },
      {
        onSuccess: (result: any) => {
          setSelectedPlayerIds([]);
          const failed = (result?.delivery || []).filter(
            (item: any) => item?.result?.status !== "sent"
          );
          if (failed.length > 0) {
            show(
              `${failed.length} invitation email${failed.length === 1 ? " was" : "s were"} not sent. You can still copy the invitation link below.`,
              "warning"
            );
          } else {
            show("Invitation email sent.", "success");
          }
        },
        onError: (error: any) => show(error?.message || "Unable to create invitations.", "error"),
      }
    );
  };

  return (
    <DrawerActionPanel
      title="Player invitations"
      description="Let golfers claim their player profile."
      icon={<Mail size={15} />}
    >
      <div className="grid gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Unclaimed players
          </p>
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {unclaimedPlayers.length === 0 ? (
              <p className="text-xs text-slate-400">No unclaimed players need invites.</p>
            ) : (
              unclaimedPlayers.map((player: any) => (
                <label
                  key={player.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-xs"
                >
                  <MuiCheckbox
                    checked={selectedPlayerIds.includes(Number(player.id))}
                    onChange={() => togglePlayer(Number(player.id))}
                    size="small"
                    sx={{ p: 0.25 }}
                  />
                  <span className="font-semibold text-slate-700">
                    {player.firstName} {player.lastName}
                  </span>
                  <span className="ml-auto truncate text-slate-400">{player.email}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={createInvites.isPending || selectedPlayerIds.length === 0}
          onClick={submit}
          className="w-full rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createInvites.isPending ? "Sending invitations..." : "Send invitations"}
        </button>
      </div>

      {invitations.length > 0 && (
        <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {invitations.slice(0, 5).map((invite: any) => (
            <div key={invite.id} className="flex items-center gap-2 px-3 py-2 text-xs">
              <span
                className={`rounded-full px-2 py-0.5 font-bold ${
                  invite.status === "claimed"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {invite.status}
              </span>
              <span className="min-w-0 flex-1 truncate text-slate-600">{invite.email}</span>
              {invite.status === "pending" && (
                <Link
                  to={`/invite/${invite.token}`}
                  className="font-bold text-blue-700 underline"
                  target="_blank"
                >
                  Link
                </Link>
              )}
              {invite.status === "pending" && (
                <button
                  type="button"
                  onClick={() => revokeInvite.mutate(Number(invite.id))}
                  className="font-bold text-red-600"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DrawerActionPanel>
  );
}

export function AuditLogPanel({ leagueId }: { leagueId: number }) {
  const { data: logs = [] } = useLeagueAuditLogs(leagueId);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={15} className="text-blue-600" />
        <div>
          <h3 className="text-sm font-black text-slate-900">Recent admin activity</h3>
          <p className="text-xs text-slate-500">Score, event, player, and setup changes.</p>
        </div>
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400">No activity recorded yet.</p>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-slate-700">{log.summary}</p>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {dayjs(log.createdAt).format("MMM D h:mm A")}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {log.user
                  ? `${log.user.firstName} ${log.user.lastName}`.trim() || log.user.email
                  : "System"}{" "}
                · {log.action}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
