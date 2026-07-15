import {
  useLeagueAuditLogs,
  useLeagueInvitations,
  useLeagueOnboarding,
} from "@api/operations/queries";
import {
  useCreateLeagueNotification,
  useCreateLeagueInvitations,
  useRevokeLeagueInvitation,
  useUpdateLeagueOnboarding,
} from "@api/operations/mutations";
import dayjs from "dayjs";
import { BellPlus, CheckCircle2, ClipboardCheck, Mail, ShieldCheck, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

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
                <p className="section-kicker">
                  League admin
                </p>
                <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{description}</p>
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

export function OnboardingChecklist({ leagueId }: { leagueId: number }) {
  const { data } = useLeagueOnboarding(leagueId);
  const update = useUpdateLeagueOnboarding(leagueId);

  if (!data || data?.onboarding?.dismissed || data?.complete) return null;

  return (
    <section className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
            Setup checklist
          </p>
          <h2 className="text-base font-black text-slate-900">Get this league ready to run</h2>
        </div>
        <button
          type="button"
          onClick={() => update.mutate({ key: "dismissed", dismissed: true })}
          className="rounded-full p-1 text-blue-400 hover:bg-white hover:text-blue-700"
          aria-label="Dismiss onboarding"
        >
          <X size={15} />
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {(data.steps || []).map((step: any) => (
          <button
            key={step.key}
            type="button"
            onClick={() => !step.complete && update.mutate({ key: step.key })}
            className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
              step.complete
                ? "border-blue-200 bg-white text-blue-700"
                : "border-white/70 bg-white/60 text-slate-600 hover:bg-white"
            }`}
          >
            <span className="mb-1 flex items-center gap-1.5">
              <CheckCircle2 size={13} className={step.complete ? "text-blue-600" : "text-slate-300"} />
              {step.complete ? "Done" : "Open"}
            </span>
            {step.label}
          </button>
        ))}
      </div>
    </section>
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
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [emails, setEmails] = useState("");

  const pendingEmails = new Set(
    invitations
      .filter((invite: any) => invite.status === "pending")
      .map((invite: any) => String(invite.email || "").toLowerCase())
  );
  const unclaimedPlayers = players.filter(
    (player: any) => !player.userId && !pendingEmails.has(String(player.email || "").toLowerCase())
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
        emails: emails
          .split(/[,\n]/)
          .map((email) => email.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setSelectedPlayerIds([]);
          setEmails("");
        },
      }
    );
  };

  return (
    <DrawerActionPanel
      title="Player invitations"
      description="Let golfers claim their player profile."
      icon={<Mail size={15} />}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
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
                  <input
                    type="checkbox"
                    checked={selectedPlayerIds.includes(Number(player.id))}
                    onChange={() => togglePlayer(Number(player.id))}
                    className="checkbox checkbox-xs"
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

        <div>
          <textarea
            value={emails}
            onChange={(event) => setEmails(event.target.value)}
            placeholder="Extra emails, separated by commas or new lines"
            className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:bg-white"
          />
          <button
            type="button"
            disabled={createInvites.isPending || (selectedPlayerIds.length === 0 && !emails.trim())}
            onClick={submit}
            className="mt-2 w-full rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createInvites.isPending ? "Creating invites..." : "Create invites"}
          </button>
        </div>
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

export function LeagueNotificationComposer({ leagueId }: { leagueId: number }) {
  const createNotification = useCreateLeagueNotification(leagueId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [includeAdmin, setIncludeAdmin] = useState(true);
  const [message, setMessage] = useState("");

  const submit = () => {
    setMessage("");
    createNotification.mutate(
      { title, body, includeAdmin },
      {
        onSuccess: (result: any) => {
          setTitle("");
          setBody("");
          setMessage(`Sent to ${result?.recipientCount ?? 0} user(s).`);
        },
        onError: (error: any) => {
          setMessage(error?.message || "Failed to send notification.");
        },
      }
    );
  };

  return (
    <DrawerActionPanel
      title="Send league notification"
      description="Create an in-app message for claimed league users."
      icon={<BellPlus size={15} />}
    >
      <div className="grid gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          maxLength={120}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-blue-600 focus:bg-white"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Body"
          maxLength={1000}
          className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:bg-white"
        />
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={includeAdmin}
            onChange={(event) => setIncludeAdmin(event.target.checked)}
            className="checkbox checkbox-xs"
          />
          Also send to league admin
        </label>
        {message && (
          <p
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              createNotification.isError ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </p>
        )}
        <button
          type="button"
          disabled={createNotification.isPending || !title.trim() || !body.trim()}
          onClick={submit}
          className="rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createNotification.isPending ? "Sending..." : "Send notification"}
        </button>
      </div>
    </DrawerActionPanel>
  );
}

export function ScorecardPrintedButton({ leagueId }: { leagueId: number }) {
  const update = useUpdateLeagueOnboarding(leagueId);
  return (
    <button
      type="button"
      onClick={() => update.mutate({ key: "scorecards" })}
      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
    >
      <ClipboardCheck size={13} />
      Mark scorecards printed
    </button>
  );
}
