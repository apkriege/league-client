import { useCreateCheckoutSession } from "@api/payments/mutations";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/context/ToastContext";
import { formatPhone } from "@/utils/format";
import dayjs from "dayjs";
import {
  CalendarRange,
  ClipboardCheck,
  Flag,
  Globe,
  Lock,
  Mail,
  Phone,
  ShieldHalf,
  Trophy,
  User,
  Users,
} from "lucide-react";

type LeaguePlayer = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type?: string;
  handicap?: number | string;
};

type LeagueTeam = {
  id: number;
  name?: string;
  players?: number[];
};

interface ReviewFormProps {
  leagueData: any;
  handleBack: () => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{children}</p>
);

export default function ReviewForm({ leagueData, handleBack }: ReviewFormProps) {
  const { show } = useToast();
  const createCheckoutSession = useCreateCheckoutSession();

  const players: LeaguePlayer[] = leagueData?.players || [];
  const teams: LeagueTeam[] = leagueData?.teams || [];
  const leagueType = String(leagueData?.type || "").toLowerCase();
  const leagueFormat = String(leagueData?.format || "").toLowerCase();
  const isTeamSeason = leagueType === "season" && leagueFormat === "team";

  const sortedPlayers = [...players].sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );
  const sortedTeams = [...teams].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );

  const fmt = (v: string, fb = "-") => (v ? v.charAt(0).toUpperCase() + v.slice(1) : fb);
  const fmtDate = (v: unknown) => {
    const d = dayjs(v as string | number | Date | null | undefined);
    return d.isValid() ? d.format("MMM D, YYYY") : "-";
  };
  const playerName = (id: number) => {
    const p = players.find((x) => Number(x.id) === Number(id));
    return p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : `#${id}`;
  };

  const handleStartCheckout = () => {
    const productName = leagueData?.name
      ? `${leagueData.name} League Setup`
      : "League Setup Payment";
    createCheckoutSession.mutate(
      {
        productName,
        unitAmount: 2000,
        currency: "usd",
        quantity: 1,
        successUrl: `${window.location.origin}/leagues/create?checkout=success`,
        cancelUrl: `${window.location.origin}/leagues/create?checkout=cancel`,
      },
      {
        onSuccess: (data) => {
          if (!data?.url) {
            show("Could not start checkout. Please try again.", "error");
            return;
          }
          window.location.href = data.url;
        },
        onError: () => show("Failed to create Stripe checkout session.", "error"),
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Review Your League"
        subTitle="Confirm everything looks correct before submitting."
        icon={<ClipboardCheck size={14} />}
        iconText="REVIEW"
      />

      {/* Stat chips */}
      <div className="mt-5 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Type",
            value: fmt(leagueType),
            sub: leagueType === "season" ? fmt(leagueFormat, "—") : "standalone",
            icon: <Trophy size={14} className="text-amber-500" />,
            bg: "bg-amber-50 border-amber-100",
          },
          {
            label: "Access",
            value: fmt(String(leagueData?.access || "")),
            sub: leagueData?.access === "public" ? "anyone can view" : "invite only",
            icon:
              leagueData?.access === "public" ? (
                <Globe size={14} className="text-blue-500" />
              ) : (
                <Lock size={14} className="text-violet-500" />
              ),
            bg:
              leagueData?.access === "public"
                ? "bg-blue-50 border-blue-100"
                : "bg-violet-50 border-violet-100",
          },
          {
            label: "Players",
            value: players.length,
            sub: `${players.filter((p) => p.type === "sub").length} subs`,
            icon: <Users size={14} className="text-primary" />,
            bg: "bg-primary/5 border-primary/10",
          },
          {
            label: isTeamSeason ? "Teams" : "Dates",
            value: isTeamSeason ? teams.length : fmtDate(leagueData?.startDate).split(",")[0],
            sub: isTeamSeason
              ? `${Math.round(players.length / Math.max(teams.length, 1))} avg per team`
              : `→ ${fmtDate(leagueData?.endDate)}`,
            icon: isTeamSeason ? (
              <ShieldHalf size={14} className="text-emerald-500" />
            ) : (
              <CalendarRange size={14} className="text-emerald-500" />
            ),
            bg: "bg-emerald-50 border-emerald-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xs flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg border ${stat.bg} shrink-0`}>{stat.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-base font-bold text-gray-800 leading-tight truncate">
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          {/* League Info */}
          <section>
            <SectionLabel>League Info</SectionLabel>
            <div className="rounded-xl border border-base-300 bg-base-100 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-base-200">
                <p className="text-base font-bold text-gray-900">{leagueData?.name || "—"}</p>
                {leagueData?.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{leagueData.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-px bg-base-200">
                {[
                  {
                    icon: <CalendarRange size={12} className="text-gray-400" />,
                    label: "Dates",
                    value: `${fmtDate(leagueData?.startDate)} – ${fmtDate(leagueData?.endDate)}`,
                  },
                  {
                    icon: <Flag size={12} className="text-gray-400" />,
                    label: "Format",
                    value:
                      leagueType === "season"
                        ? `${fmt(leagueType)} · ${fmt(leagueFormat)}`
                        : fmt(leagueType),
                  },
                  {
                    icon: <User size={12} className="text-gray-400" />,
                    label: "Contact",
                    value:
                      `${leagueData?.contactFirstName || ""} ${leagueData?.contactLastName || ""}`.trim() ||
                      "—",
                  },
                  {
                    icon: <Mail size={12} className="text-gray-400" />,
                    label: "Email",
                    value: leagueData?.contactEmail || "—",
                  },
                  {
                    icon: <Phone size={12} className="text-gray-400" />,
                    label: "Phone",
                    value: leagueData?.contactPhone ? formatPhone(leagueData.contactPhone) : "—",
                    span: true,
                  },
                ].map(({ icon, label, value, span }) => (
                  <div
                    key={label}
                    className={`bg-base-100 px-4 py-2.5 flex items-start gap-2 ${span ? "col-span-2" : ""}`}
                  >
                    <span className="mt-0.5 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                        {label}
                      </p>
                      <p className="text-xs text-gray-700 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Players */}
          <section>
            <SectionLabel>Players · {sortedPlayers.length}</SectionLabel>
            {sortedPlayers.length === 0 ? (
              <p className="text-xs text-gray-400">No players added.</p>
            ) : (
              <div className="rounded-xl border border-base-300 bg-base-100 shadow-xs overflow-hidden">
                <div className="grid grid-cols-[1fr_56px_56px] border-b border-base-200 bg-base-200/60 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Player</span>
                  <span className="text-center">Type</span>
                  <span className="text-right">HCP</span>
                </div>
                <div className="divide-y divide-base-200 max-h-64 overflow-auto">
                  {sortedPlayers.map((p) => {
                    const initials =
                      `${(p.firstName || "")[0] || ""}${(p.lastName || "")[0] || ""}`.toUpperCase();
                    const isSub = p.type === "sub";
                    return (
                      <div
                        key={p.id}
                        className="grid grid-cols-[1fr_56px_56px] px-4 py-2 items-center"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="bg-primary text-primary-content rounded-lg w-7 h-7 flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
                            {initials || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {`${p.firstName || ""} ${p.lastName || ""}`.trim() || `#${p.id}`}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">{p.email || "—"}</p>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                              isSub
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-primary/8 text-primary border border-primary/15"
                            }`}
                          >
                            {p.type || "—"}
                          </span>
                        </div>
                        <p className="text-right text-xs font-bold text-gray-700">
                          {p.handicap ?? "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Teams */}
          {isTeamSeason && (
            <section>
              <SectionLabel>Teams · {sortedTeams.length}</SectionLabel>
              {sortedTeams.length === 0 ? (
                <p className="text-xs text-gray-400">No teams created.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sortedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="rounded-xl border border-base-300 bg-base-100 shadow-xs overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 bg-base-200/60 border-b border-base-200">
                        <ShieldHalf size={12} className="text-primary/50 shrink-0" />
                        <span className="text-xs font-bold text-gray-800 truncate flex-1">
                          {team.name || `Team #${team.id}`}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {team.players?.length ?? 0}p
                        </span>
                      </div>
                      <div className="p-2 flex flex-wrap gap-1">
                        {(team.players ?? [])
                          .sort((a, b) => playerName(a).localeCompare(playerName(b)))
                          .map((pid) => {
                            const p = players.find((x) => Number(x.id) === Number(pid));
                            return (
                              <span
                                key={pid}
                                className="inline-flex items-center gap-1 rounded-lg bg-base-200 px-2 py-0.5 text-[11px] text-gray-600"
                              >
                                {playerName(pid)}
                                <span className="text-gray-400">· {p?.handicap ?? "—"}</span>
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:sticky xl:top-4 space-y-3">
          <div className="rounded-xl border border-base-300 bg-base-100 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-primary text-primary-content">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                Order Summary
              </p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-extrabold">$20</p>
                <p className="text-xs opacity-60">one-time setup</p>
              </div>
            </div>

            <div className="px-4 py-3 space-y-2 text-xs border-b border-base-200">
              {[
                { label: "League", value: leagueData?.name || "—" },
                { label: "Type", value: fmt(leagueType) },
                {
                  label: "Format",
                  value: leagueType === "season" ? fmt(leagueFormat, "—") : "N/A",
                },
                { label: "Players", value: `${players.length}` },
                ...(isTeamSeason ? [{ label: "Teams", value: `${teams.length}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="font-semibold text-gray-700 truncate text-right max-w-[120px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 flex flex-col gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm w-full"
                onClick={handleStartCheckout}
                disabled={createCheckoutSession.isPending}
              >
                {createCheckoutSession.isPending ? "Starting…" : "Pay with Stripe →"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full text-gray-400"
                onClick={handleBack}
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
