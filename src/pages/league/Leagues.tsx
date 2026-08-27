import Badge from "@/components/layout/Badge";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/context/useToast";
import { useAppStore } from "@/stores/appStore";

import { useAdminLeagues } from "@api/admin/queries";
import { useLeagues } from "@api/league/queries";
import {
  Plus,
  Globe,
  ArrowUpRight,
  Lock,
  Edit,
  Info,
  Search,
  CalendarDays,
  CheckCircle2,
  Users,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { clearCreateLeagueDraft } from "./leagueDraft";
import { confirmCheckoutSession } from "@api/payments";
import PaymentReturnNotice from "@/features/payments/components/PaymentReturnNotice";
import { clearCheckoutReturnFromUrl, getCheckoutReturn } from "@/features/payments/checkoutReturn";
import {
  PaymentPipelineError,
  toPaymentPipelineError,
} from "@/features/payments/PaymentPipelineError";
import dayjs from "dayjs";
import { getLeagueDateInputValue } from "./leagueDates";

export default function Leagues() {
  const { user } = useAppStore();
  const role = String(user?.role || "").toUpperCase();
  const canManageLeagues = role === "ADMIN" || role === "SUPER";
  const adminLeaguesQuery = useAdminLeagues(canManageLeagues);
  const memberLeaguesQuery = useLeagues(Boolean(user) && role !== "VIEWER");
  const viewerLeaguesQuery = useLeagues(role === "VIEWER");
  const memberLeagues = (memberLeaguesQuery.data as any)?.leagues ?? [];
  const adminLeagues = adminLeaguesQuery.data ?? [];
  const adminLeagueIds = new Set(adminLeagues.map((league: any) => Number(league.id)));
  const leagues = canManageLeagues
    ? [
        ...adminLeagues,
        ...memberLeagues.filter((league: any) => !adminLeagueIds.has(Number(league.id))),
      ]
    : ((viewerLeaguesQuery.data as any)?.leagues ?? memberLeagues);
  const activeQueries = canManageLeagues
    ? [adminLeaguesQuery, memberLeaguesQuery]
    : [role === "VIEWER" ? viewerLeaguesQuery : memberLeaguesQuery];
  const isLoading = activeQueries.some((query) => query.isLoading);
  const activeError = activeQueries.find((query) => query.isError)?.error;
  const { show } = useToast();
  const checkoutReturnStartedRef = useRef(false);
  const [checkoutStatus, setCheckoutStatus] = useState(
    () => getCheckoutReturn(window.location.search).checkout
  );
  const [checkoutReturnMessage, setCheckoutReturnMessage] = useState<string | null>(null);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [confirmationAttempt, setConfirmationAttempt] = useState(0);
  const [paymentPipelineError, setPaymentPipelineError] = useState<PaymentPipelineError | null>(
    null
  );

  useEffect(() => {
    if (!checkoutStatus || checkoutReturnStartedRef.current) return;

    if (checkoutStatus === "registration_cancel") {
      clearCheckoutReturnFromUrl();
      show("Registration checkout was canceled.", "warning");
      return;
    }

    if (checkoutStatus !== "registration_success") return;
    checkoutReturnStartedRef.current = true;

    const confirmRegistration = async () => {
      const { sessionId } = getCheckoutReturn(window.location.search);
      if (!sessionId) {
        setPaymentPipelineError(
          new PaymentPipelineError(
            "We could not identify the returned checkout. Refresh the page to check billing before trying another payment."
          )
        );
        return;
      }

      setCheckoutReturnMessage(null);
      setIsConfirmingCheckout(true);
      try {
        const confirmation = await confirmCheckoutSession(sessionId);
        if (confirmation.status === "processing") {
          setCheckoutReturnMessage(
            confirmation.message || "Your payment is still processing. Check again shortly."
          );
          return;
        }
        clearCheckoutReturnFromUrl();
        setCheckoutStatus(null);
        if (confirmation.status === "failed") {
          setPaymentPipelineError(
            new PaymentPipelineError(
              confirmation.message ||
                "The payment pipeline did not complete. Refresh before trying checkout again."
            )
          );
          return;
        }
        show("Registration payment confirmed. You can now create your league.", "success");
      } catch (error: unknown) {
        setPaymentPipelineError(
          toPaymentPipelineError(
            error,
            "We could not safely confirm the payment. Refresh before trying another payment."
          )
        );
      } finally {
        setIsConfirmingCheckout(false);
      }
    };

    void confirmRegistration();
  }, [checkoutStatus, confirmationAttempt, show]);

  if (paymentPipelineError) {
    throw paymentPipelineError;
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="My Leagues" subTitle="Manage your leagues, players, and events" />
      {canManageLeagues && (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950 shadow-xs sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 shrink-0 text-sky-600" size={17} />
            <div>
              <p className="text-sm font-bold">
                Please check for your course before creating a league
              </p>
              <p className="mt-0.5 text-xs leading-5 text-sky-900/80">
                We’re actively building out our courses database. Search the Courses tab first to
                confirm your course is available. If it isn’t listed, submit a course request from
                that page before creating your league.
              </p>
            </div>
          </div>
          <Link
            to="/courses"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-800"
          >
            <Search size={14} />
            Search Courses
          </Link>
        </div>
      )}
      {checkoutStatus && (isConfirmingCheckout || checkoutReturnMessage) && (
        <PaymentReturnNotice
          isChecking={isConfirmingCheckout}
          message={
            isConfirmingCheckout
              ? "Confirming your payment..."
              : checkoutReturnMessage || "We could not confirm your payment."
          }
          onRetry={() => {
            checkoutReturnStartedRef.current = false;
            setConfirmationAttempt((attempt) => attempt + 1);
          }}
        />
      )}
      {activeError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(activeError as any)?.message || "Unable to load leagues."}
        </div>
      )}
      {isLoading && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Loading leagues...
        </div>
      )}
      {!isLoading && !activeError && leagues.length === 0 && !canManageLeagues && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white px-5 py-8 text-center">
          <p className="text-sm font-bold text-gray-700">No league memberships yet</p>
          <p className="mt-1 text-xs text-gray-400">
            When a league admin invites you or links your player profile, your leagues will appear
            here.
          </p>
        </div>
      )}
      <div className="mt-2 grid auto-rows-fr grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {canManageLeagues && (
          <Link
            to="/leagues/create"
            className="block h-full"
            onClick={() => clearCreateLeagueDraft(Number(user?.id))}
          >
            <Card className="bg-slate-900 h-full flex items-center justify-center cursor-pointer hover:bg-slate-900/95 transition-colors">
              <div className="flex flex-col items-center justify-center text-center">
                <div className=" bg-gray-200 p-3 rounded-full mb-3 mt-3">
                  <Plus size={24} />
                </div>
                <p className="text-lg font-semibold mb-2">Create New League</p>
                <p className="text-xs text-gray-500 w-2/3 text-center mb-2">
                  Set up a new league and invite players
                </p>
              </div>
            </Card>
          </Link>
        )}
        {leagues &&
          leagues.map((league: any) => (
            <LeagueCard
              key={league.id}
              league={league}
              canManageLeague={canManageLeagues && adminLeagueIds.has(Number(league.id))}
              canRenewLeague={Number(league.adminId) === Number(user?.id)}
            />
          ))}
      </div>
    </div>
  );
}

const LeagueCard = ({ league, canManageLeague, canRenewLeague }: any) => {
  const eventCount = Number(league?._count?.events ?? league?.events?.length ?? 0);
  const playerCount = Number(league?._count?.players ?? league?.players?.length ?? 0);
  const rawRoundCount = Number(league?.roundCount ?? eventCount);
  const roundCount = Number.isFinite(rawRoundCount) ? Math.max(0, rawRoundCount) : 0;
  const rawCompletedRoundCount = Number(league?.completedRoundCount ?? 0);
  const completedRoundCount = Number.isFinite(rawCompletedRoundCount)
    ? Math.min(roundCount, Math.max(0, rawCompletedRoundCount))
    : 0;
  const today = dayjs().startOf("day");
  const startDateKey = getLeagueDateInputValue(league?.startDate);
  const endDateKey = getLeagueDateInputValue(league?.endDate);
  const seasonEnded = Boolean(endDateKey) && dayjs(endDateKey).endOf("day").isBefore(today);
  const seasonUpcoming =
    Boolean(startDateKey) && dayjs(startDateKey).startOf("day").isAfter(today);
  const daysUntilEnd = endDateKey ? dayjs(endDateKey).startOf("day").diff(today, "day") : null;
  const renewalDue =
    daysUntilEnd !== null &&
    daysUntilEnd >= 0 &&
    daysUntilEnd <= 30 &&
    !league?.renewedLeague?.id;
  const seasonStatus = league?.billingStatus === "payment_due"
    ? "Payment Due"
    : league?.seasonStatus === "reopened"
      ? "Reopened"
    : seasonEnded || league?.seasonStatus === "archived"
    ? "Past Season"
    : renewalDue
      ? "Renewal Due"
    : seasonUpcoming
      ? "Upcoming"
      : roundCount > 0
        ? "Live"
        : "Not Started";
  const leaguePath = canManageLeague
    ? `/league/${league.id}/admin`
    : `/league/${league.id}`;
  const dateRange =
    startDateKey && endDateKey
      ? `${dayjs(startDateKey).format("MMM D, YYYY")} – ${dayjs(endDateKey).format(
          "MMM D, YYYY"
        )}`
      : null;

  return (
    <Card className="group flex h-full flex-col border-slate-200 bg-white p-4! transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <Badge
          className="mb-0!"
          size="xs"
          text={seasonStatus}
          icon={
            seasonStatus === "Live" ? (
              <Globe size={12} />
            ) : seasonStatus === "Not Started" ? (
              <Lock size={12} />
            ) : (
              <CalendarDays size={12} />
            )
          }
          variant={seasonStatus === "Live" ? "primary" : ""}
        />
        {canManageLeague && (
          <Link
            to={`/league/${league.id}/edit`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          >
            <Edit size={10} />
            Edit
          </Link>
        )}
      </div>
      <Link to={leaguePath} className="mt-2.5 flex flex-1 cursor-pointer flex-col">
        <div className="flex flex-1 flex-col">
          <h3 className="text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">
            {league.name}
          </h3>

          <div className="mt-2 flex flex-col items-start gap-1.5 text-xs font-semibold text-slate-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {league?.type && (
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <Trophy
                    aria-hidden="true"
                    className="text-slate-400"
                    size={11}
                    strokeWidth={1.75}
                  />
                  {league.type}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Users
                  aria-hidden="true"
                  className="text-slate-400"
                  size={11}
                  strokeWidth={1.75}
                />
                {playerCount} {playerCount === 1 ? "Player" : "Players"}
              </span>
            </div>
            {dateRange && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  aria-hidden="true"
                  className="text-slate-400"
                  size={11}
                  strokeWidth={1.75}
                />
                <span>{dateRange}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                aria-hidden="true"
                className="text-slate-400"
                size={11}
                strokeWidth={1.75}
              />
              {completedRoundCount} / {roundCount} {roundCount === 1 ? "round" : "rounds"} complete
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-slate-500">
            <span className="text-[10px] font-bold tracking-wider">OPEN LEAGUE</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 transition-all group-hover:bg-blue-600 group-hover:text-white">
              <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </Link>
      {canRenewLeague && String(league?.type).toLowerCase() === "season" && (
        <Link
          to={
            league?.renewedLeague?.id
              ? `/league/${league.renewedLeague.id}/admin`
              : `/leagues/create?renewFrom=${league.id}`
          }
          onClick={() => {
            if (!league?.renewedLeague?.id) clearCreateLeagueDraft(Number(league.adminId));
          }}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-800 transition hover:bg-sky-100"
        >
          <RefreshCw size={13} />
          {league?.renewedLeague?.id ? "Open Next Season" : "Create Next Season"}
        </Link>
      )}
    </Card>
  );
};
