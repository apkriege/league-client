import { useLeagueAuditLogs } from "@api/operations/queries";
import dayjs from "dayjs";
import { ShieldCheck } from "lucide-react";
export { DrawerActionPanel } from "./DrawerActionPanel";
export { default as InvitePlayersPanel } from "@/features/invitations/components/InvitePlayersPanel";

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
                · {log.action === "swap_players" ? "sub_players" : log.action}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
