import PageHeader from "@/components/layout/PageHeader";
import SectionKicker from "@/components/layout/SectionKicker";
import { formatPhone } from "@/utils/format";
import { BILLING_MIN_GOLFERS, BILLING_PRICE_PER_GOLFER, formatBillingPrice, getLeagueBillableGolfers } from "@/lib/billing";
import dayjs from "dayjs";
import {
  CalendarRange,
  Flag,
  Mail,
  Phone,
  ShieldHalf,
  Trophy,
  User,
  Users,
} from "lucide-react";
import {
  getHandicapHoleCount,
  getLeagueHoleFormatLabel,
} from "@/features/leagues/leagueHoleFormat";
import PaymentAccessCodeForm from "@/features/payments/components/PaymentAccessCodeForm";
import TeamBuilderCard, {
  type TeamBuilderPlayer,
} from "@/components/league/TeamBuilderCard";

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
  billing?: any;
  isBillingLoading?: boolean;
  onPaymentAccessGranted?: () => void | Promise<unknown>;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <SectionKicker className="mb-2">{children}</SectionKicker>
);

export default function ReviewForm({
  leagueData,
  billing,
  isBillingLoading = false,
  onPaymentAccessGranted,
}: ReviewFormProps) {
  const players: LeaguePlayer[] = leagueData?.players || [];
  const teams: LeagueTeam[] = leagueData?.teams || [];
  const leagueType = String(leagueData?.type || "").toLowerCase();
  const leagueFormat = String(leagueData?.format || "").toLowerCase();
  const isTeamSeason = leagueType === "season" && leagueFormat === "team";
  const handicapHoleCount = getHandicapHoleCount(leagueData?.holeFormat);
  const includedGolfers = Number(billing?.includedGolfers || 0);
  const allocatedGolfers = Number(billing?.allocatedGolfers || 0);
  const requestedGolfers = getLeagueBillableGolfers(players);
  const paymentExempt = Boolean(billing?.paymentExempt);
  const additionalGolfersRequired = Math.max(
    0,
    paymentExempt ? 0 : allocatedGolfers + requestedGolfers - includedGolfers
  );
  const additionalCost = additionalGolfersRequired * BILLING_PRICE_PER_GOLFER;
  const needsPayment = !isBillingLoading && additionalGolfersRequired > 0;

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
  const getTeamPlayers = (team: LeagueTeam): TeamBuilderPlayer[] =>
    (team.players ?? [])
      .map((playerId) => {
        const player = players.find((candidate) => Number(candidate.id) === Number(playerId));

        return {
          id: Number(playerId),
          firstName: player?.firstName || (player ? "Unnamed" : `Player #${playerId}`),
          lastName: player?.lastName || "",
          handicap: player?.handicap,
        };
      })
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );

  return (
    <div>
      <PageHeader
        title="Review Your League"
        subTitle="Confirm everything looks correct before submitting."
      />

      {/* Stat chips */}
      <div className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          {
            label: "Type",
            value: fmt(leagueType),
            sub: leagueType === "season" ? fmt(leagueFormat, "—") : "standalone",
            icon: <Trophy size={14} className="text-amber-500" />,
            bg: "bg-amber-50 border-amber-100",
          },
          {
            label: "Players",
            value: players.length,
            sub: `${players.filter((p) => p.type === "sub").length} subs`,
            icon: <Users size={14} className="text-slate-900" />,
            bg: "bg-slate-900/5 border-slate-900/10",
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
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-base font-bold text-gray-900">{leagueData?.name || "—"}</p>
                {leagueData?.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{leagueData.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100">
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
                    icon: <Flag size={12} className="text-gray-400" />,
                    label: "Holes / Handicap",
                    value: `${getLeagueHoleFormatLabel(leagueData?.holeFormat)} · ${handicapHoleCount}-hole HCP`,
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
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-2 bg-white px-4 py-2.5"
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
              <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <SectionKicker
                  as="div"
                  className="grid grid-cols-[1fr_56px_56px] border-b border-slate-100 bg-slate-100/60 px-4 py-2"
                >
                  <span>Player</span>
                  <span className="text-center">Type</span>
                  <span className="whitespace-nowrap text-right">
                    {handicapHoleCount}H HCP
                  </span>
                </SectionKicker>
                <div className="max-h-64 divide-y divide-slate-100 overflow-auto">
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
                          <div className="bg-slate-900 text-white rounded-lg w-7 h-7 flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
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
                                : "bg-slate-900/8 text-slate-900 border border-slate-900/15"
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {sortedTeams.map((team) => (
                    <TeamBuilderCard
                      key={team.id}
                      name={team.name || `Team #${team.id}`}
                      players={getTeamPlayers(team)}
                      density="compact"
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:sticky xl:top-4 space-y-3">
          {needsPayment && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                  Billing Summary
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-extrabold">
                    {formatBillingPrice(additionalCost)}
                  </p>
                  <p className="text-xs opacity-60">
                    {`${additionalGolfersRequired} golfers due`}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 space-y-2 text-xs border-b border-slate-100">
                {[
                  { label: "League", value: leagueData?.name || "—" },
                  { label: "Roster", value: `${players.length}` },
                  { label: "Regular Players", value: `${players.filter((player) => String(player.type || "player").toLowerCase() === "player").length}` },
                  { label: "League Minimum", value: `${BILLING_MIN_GOLFERS}` },
                  { label: "Billable Golfers", value: `${requestedGolfers}` },
                  {
                    label: "Payment Required",
                    value: `${additionalGolfersRequired}`,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 font-medium">{label}</span>
                    <span className="font-semibold text-gray-700 truncate text-right max-w-[120px]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3">
                <p className="text-[11px] leading-5 text-gray-500">
                  League creation is locked until your golfer capacity covers this roster.
                </p>
                <div className="mt-3">
                  <PaymentAccessCodeForm onRedeemed={onPaymentAccessGranted} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
