import { Link, Outlet, useNavigate, useLocation, useParams } from "react-router";
import { logout } from "@api/auth";
import { useAppStore } from "@/stores/appStore";
import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  LandPlot,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
  ScanSearch,
  Settings,
  ShieldHalf,
  TicketCheck,
  User,
  Users,
} from "lucide-react";
import { useLeague, useLeagueEvents } from "@api/league/queries";
import { useAdminLeagues } from "@api/admin/queries";
import NotificationsMenu from "@/components/layout/NotificationsMenu";
import lnLogo from "@/assets/league-night-logo.png";
import { formatEventDate } from "@/utils/eventDate";

const Section = ({ section, collapsed }: { section: string; collapsed?: boolean }) => (
  <div className="mt-5 mb-2 flex flex-col">
    {!collapsed && (
      <p className="app-section-label text-[10px] uppercase ml-2 font-black">{section}</p>
    )}
  </div>
);

const NavLink = ({
  to,
  text,
  icon,
  isActive,
  collapsed,
  disabled,
}: {
  to: string;
  text: string;
  icon: any;
  isActive: boolean;
  collapsed?: boolean;
  disabled?: boolean;
}) => {
  return (
    <Link
      to={to}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`app-nav-link px-2 py-2.5 flex items-center ${
        disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
      } ${isActive ? "app-nav-link-active" : ""}`}
    >
      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-xl bg-white/5">
        {icon}
      </span>
      {!collapsed && <span className="text-sm font-semibold">{text}</span>}
    </Link>
  );
};

const NavWithSubLinks = ({
  section,
  links,
  icon,
  collapsed,
}: {
  section: string;
  links: {
    to: string;
    name: string;
    date: string;
    timeZone: string;
    completed: boolean;
    eventType: string;
  }[];
  icon: any;
  collapsed?: boolean;
}) => (
  <ul className="m-0! w-full list-none p-0">
    <li>
      <details open>
        <summary className="app-nav-link text-sm px-2 py-2">
          <span
            className={`${collapsed ? "" : "mr-2"} inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white/5`}
          >
            {icon}
          </span>
          {!collapsed && section}
        </summary>
        {!collapsed && (
          <ul className="px-2 py-1">
            {links.map((link, idx) => (
              <li key={idx} className="flex">
                <Link
                  to={link.to}
                  className={`rounded-xl px-2 py-1.5 hover:bg-white/8 hover:text-white flex items-center justify-between transition-colors text-xs text-white/60`}
                >
                  <div>
                    {link.name} -
                    <span className="ml-1 text-[10px]">
                      {formatEventDate(
                        link.date,
                        { month: "2-digit", day: "2-digit", year: "2-digit" },
                        "en-US",
                        link.timeZone,
                      )}
                    </span>
                  </div>
                  {link.eventType !== "off" && link.completed && (
                    <div>
                      <Check className="ml-2 text-sky-300" size={16} strokeWidth={3} />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </details>
    </li>
  </ul>
);

const modelEvents = (events: any) => {
  return events.map((event: any) => ({
    id: event.id,
    name: event.name,
    date: event.startsAt,
    timeZone: event.timeZone,
    to: `/league/${event.leagueId}/events/${event.id}`,
    completed: event.completed,
    eventType: event.eventType,
  }));
};

export default function BaseLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { leagueId } = useParams();
  const { user, clearUser, clearLeagueId } = useAppStore();
  const [isOpen, setIsOpen] = useState(true);

  const playerId = user?.leagues?.find((ul: any) => Number(ul.id) === Number(leagueId))?.playerId;
  const role = String(user?.role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER";
  const isAdmin = role === "ADMIN" || isSuperAdmin;
  const isLeagueViewer = role === "VIEWER";
  const numericLeagueId = Number(leagueId);
  const isLeagueRoute = Boolean(
    leagueId && leagueId !== "undefined" && Number.isFinite(numericLeagueId)
  );
  const memberLeagueIds = Array.isArray(user?.leagues)
    ? user.leagues.map((league: any) => Number(league?.id)).filter(Boolean)
    : [];
  const isLeagueMember = isLeagueRoute ? memberLeagueIds.includes(numericLeagueId) : false;
  const { data: adminLeagues = [] } = useAdminLeagues(isAdmin && isLeagueRoute);
  const adminLeagueIds = Array.isArray(adminLeagues)
    ? adminLeagues.map((league: any) => Number(league?.id)).filter(Boolean)
    : [];
  const hasLeagueAccess =
    !isLeagueRoute || isSuperAdmin || isLeagueMember || adminLeagueIds.includes(numericLeagueId);

  const { data: league } = useLeague(Number(leagueId)!, hasLeagueAccess);
  const { data: events } = useLeagueEvents(Number(leagueId), hasLeagueAccess);
  const evs = events ? modelEvents(events) : [];
  const isTournamentLeague = String(league?.type || "").toLowerCase() === "tournament";
  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Account";

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      });
      return;
    }
    if (location.pathname.startsWith("/superadmin") && !isSuperAdmin) {
      navigate("/leagues");
      return;
    }
    // can't do this if the user is new a creating a fresh league
    // if (!leagueId) {
    //   navigate("/dashboard");
    // }
  }, [user, leagueId, navigate, location.pathname, location.search, location.hash, isSuperAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearUser();
      clearLeagueId();
      window.location.href = "/login";
    }
  };

  const subDisabled = !leagueId || leagueId === "undefined";

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <div
        className={`app-sidebar text-gray-300 border-r transition-all duration-300 ${
          isOpen ? "w-52 md:w-64" : "w-16 md:w-20"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between">
          {isOpen && (
            <div className="hidden items-center gap-3 md:flex">
              <span className="flex h-11 w-16 items-center justify-center overflow-hidden p-1">
                <img src={lnLogo} alt="League Night Pro" className="h-full w-full object-contain" />
              </span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 md:px-3 space-y-1 overflow-y-auto">
          <Section section="Leagues" collapsed={!isOpen} />
          <NavLink
            to="/leagues"
            text="Leagues"
            icon={<LayoutDashboard size={19} />}
            isActive={location.pathname === "/admin/dashboard"}
            collapsed={!isOpen}
          />
          <NavLink
            to="/courses"
            text="Courses"
            icon={<LandPlot size={19} />}
            isActive={location.pathname === "/courses" || location.pathname.startsWith("/courses/")}
            collapsed={!isOpen}
          />
          <Section section={league?.name || "League"} collapsed={!isOpen} />
          {isAdmin && (
            <NavLink
              to={`/league/${leagueId}/admin`}
              text="Admin"
              icon={<TicketCheck size={19} />}
              isActive={location.pathname === `/league/${leagueId}/admin`}
              disabled={subDisabled}
              collapsed={!isOpen}
            />
          )}
          <NavLink
            to={`/league/${leagueId}/player/${playerId}`}
            text="Player Dashboard"
            icon={<PanelsTopLeft size={19} />}
            isActive={location.pathname === `/league/${leagueId}/player/${playerId}`}
            disabled={subDisabled || !playerId}
            collapsed={!isOpen}
          />
          <NavLink
            to={`/league/${leagueId}`}
            text="League"
            icon={<LayoutDashboard size={19} />}
            isActive={location.pathname === `/league/${leagueId}`}
            disabled={subDisabled}
            collapsed={!isOpen}
          />
          <NavLink
            to={`/league/${leagueId}/players`}
            text="Players"
            icon={<Users size={19} />}
            isActive={location.pathname === `/league/${leagueId}/players`}
            disabled={subDisabled}
            collapsed={!isOpen}
          />
          {!isTournamentLeague && (
            <NavLink
              to={`/league/${leagueId}/teams`}
              text="Teams"
              icon={<ShieldHalf size={19} />}
              isActive={location.pathname === `/league/${leagueId}/teams`}
              disabled={subDisabled}
              collapsed={!isOpen}
            />
          )}
          <NavLink
            to={`/league/${leagueId}/schedule`}
            text="Schedule"
            icon={<Calendar size={19} />}
            isActive={location.pathname === `/league/${leagueId}/schedule`}
            disabled={subDisabled}
            collapsed={!isOpen}
          />
          {!subDisabled && (
            <NavWithSubLinks
              section="Events"
              links={evs}
              icon={<LandPlot size={18} />}
              collapsed={!isOpen}
            />
          )}

          {isSuperAdmin && (
            <>
              <Section section="Super Admin" collapsed={!isOpen} />
              <NavLink
                to="/superadmin/leagues"
                text="View Leagues"
                icon={<ScanSearch size={19} />}
                isActive={location.pathname.startsWith("/superadmin/leagues")}
                collapsed={!isOpen}
              />
              <NavLink
                to="/superadmin/courses"
                text="Manage Courses"
                icon={<Settings size={19} />}
                isActive={location.pathname.startsWith("/superadmin/courses")}
                collapsed={!isOpen}
              />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2 md:p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-2xl w-full text-white/52 hover:bg-white/8 hover:text-white transition-colors ${
              isOpen ? "gap-4 px-2 py-2" : "justify-center p-2"
            }`}
            aria-label="Sign out"
          >
            <LogOut size={19} />
            {isOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-main flex flex-col flex-1 overflow-hidden">
        <div className="app-topbar sticky top-0 z-10 border-b px-4 md:px-6 py-4 flex justify-between">
          <div className="hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
              Command center
            </p>
            <p className="mt-0.5 text-sm font-black text-slate-900">
              {league?.name || "Golf operations"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isLeagueViewer && <NotificationsMenu />}
            <div className="flex items-center gap-3 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 shadow-sm">
              <User size={22} className="rounded-full bg-sky-100 p-1 text-blue-800" />
              <h2 className="text-sm font-black text-slate-900">{displayName}</h2>
            </div>
          </div>
        </div>
        <div className="app-content px-5 py-6 md:px-8 md:py-8 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
