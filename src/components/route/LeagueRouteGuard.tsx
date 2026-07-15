import { useAdminLeagues } from "@api/admin/queries";
import PageState from "@/components/layout/PageState";
import { useAppStore } from "@/stores/appStore";
import { Navigate, Outlet, useLocation, useParams } from "react-router";

type LeagueRouteGuardProps = {
  adminOnly?: boolean;
  superAdminOnly?: boolean;
};

const normalizeRole = (role: unknown) => String(role || "").toUpperCase();

export default function LeagueRouteGuard({
  adminOnly = false,
  superAdminOnly = false,
}: LeagueRouteGuardProps) {
  const location = useLocation();
  const { leagueId } = useParams();
  const { user } = useAppStore();

  const role = normalizeRole(user?.role);
  const isSuperAdmin = role === "SUPER";
  const isAdminRole = role === "ADMIN" || isSuperAdmin;
  const numericLeagueId = Number(leagueId);
  const memberLeagueIds = Array.isArray(user?.leagues)
    ? user.leagues.map((league: any) => Number(league?.id)).filter(Boolean)
    : [];

  const { data: adminLeagues = [], isLoading: adminLeaguesLoading } = useAdminLeagues(isAdminRole);
  const adminLeagueIds = Array.isArray(adminLeagues)
    ? adminLeagues.map((league: any) => Number(league?.id)).filter(Boolean)
    : [];

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (superAdminOnly) {
    if (!isSuperAdmin) {
      return (
        <PageState
          title="Access Denied"
          message="You must be a super admin to open this page."
          variant="forbidden"
          actionTo="/leagues"
          actionLabel="Back to Leagues"
        />
      );
    }

    return <Outlet />;
  }

  if (adminOnly && !numericLeagueId) {
    if (!isAdminRole) {
      return (
        <PageState
          title="Access Denied"
          message="You must be an admin to open this page."
          variant="forbidden"
          actionTo="/leagues"
          actionLabel="Back to Leagues"
        />
      );
    }

    return <Outlet />;
  }

  if (!numericLeagueId) {
    return <Outlet />;
  }

  const isMember = memberLeagueIds.includes(numericLeagueId);
  const isLeagueAdmin = isSuperAdmin || adminLeagueIds.includes(numericLeagueId);

  if (isAdminRole && adminLeaguesLoading) {
    return (
      <div className="loading-state">
        Checking access...
      </div>
    );
  }

  if (adminOnly) {
    if (!isLeagueAdmin) {
      return (
        <PageState
          title="Access Denied"
          message="You must be an admin of this league to open this page."
          variant="forbidden"
          actionTo={numericLeagueId ? `/league/${numericLeagueId}` : "/leagues"}
          actionLabel="Back to League"
        />
      );
    }

    return <Outlet />;
  }

  if (!isMember && !isLeagueAdmin) {
    return (
      <PageState
        title="Access Denied"
        message="You must be a member or admin of this league to view this page."
        variant="forbidden"
      />
    );
  }

  return <Outlet />;
}
