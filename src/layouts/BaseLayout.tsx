import { Link, Outlet, useNavigate, useLocation, useParams } from "react-router";
import { logout } from "@api/auth";
import { useAppStore } from "@/stores/appStore";
import { useEffect, useState } from "react";
import {
  BookOpen,
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
import dayjs from "dayjs";

const Section = ({ section }: { section: string }) => (
  <div className="mt-5 mb-2 flex flex-col">
    <p className="text-[10px] uppercase ml-2 font-semibold text-gray-500">{section}</p>
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
      className={`px-2 py-2.5 rounded transition-colors flex items-center ${
        disabled
          ? "opacity-40 cursor-not-allowed pointer-events-none"
          : "hover:bg-secondary/5 hover:text-secondary/80"
      } ${isActive ? "border-l-2 border-secondary bg-secondary/10 text-secondary" : ""}`}
    >
      <span className="mr-3">{icon}</span>
      {!collapsed && <span className="text-sm">{text}</span>}
    </Link>
  );
};

const NavWithSubLinks = ({
  section,
  links,
  icon,
}: {
  section: string;
  links: { to: string; name: string; date: Date; completed: boolean; eventType: string }[];
  icon: any;
}) => (
  <ul className="menu w-full m-0! p-0">
    <li>
      <details open>
        <summary className="text-sm px-2 py-1">
          <span className="mr-2">{icon}</span>
          {section}
        </summary>
        <ul className="px-2 py-1">
          {links.map((link, idx) => (
            <li key={idx} className="flex">
              <Link
                to={link.to}
                className={`px-2 py-1 rounded hover:bg-primary/80 hover:text-primary-content flex items-center justify-between transition-colors text-xs`}
              >
                <div className="">
                  {link.name} -
                  <span className="ml-1 text-[10px]">{dayjs(link.date).format("MM/DD/YY")}</span>
                </div>
                {link.eventType !== "off" && link.completed && (
                  <div>
                    <Check className="ml-2 text-green-500" size={16} strokeWidth={3} />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </li>
  </ul>
);

const modelEvents = (events: any) => {
  return events.map((event: any) => ({
    id: event.id,
    name: event.name,
    date: event.date,
    to: `/league/${event.leagueId}/events/${event.id}`,
    completed: event.completed,
    eventType: event.eventType,
  }));
};

export default function BaseLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { leagueId } = useParams();
  const { user } = useAppStore();
  const [isOpen, setIsOpen] = useState(true);

  const playerId = user?.leagues?.find((ul: any) => Number(ul.id) === Number(leagueId))?.playerId;
  const role = String(user?.role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER";
  const isAdmin = role === "ADMIN" || isSuperAdmin;
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
    !isLeagueRoute ||
    isSuperAdmin ||
    isLeagueMember ||
    adminLeagueIds.includes(numericLeagueId);

  const { data: league } = useLeague(Number(leagueId)!, hasLeagueAccess);
  const { data: events } = useLeagueEvents(Number(leagueId), hasLeagueAccess);
  const evs = events ? modelEvents(events) : [];
  const isTournamentLeague = String(league?.type || "").toLowerCase() === "tournament";

  useEffect(() => {
    // Set the golf theme on mount
    document.documentElement.setAttribute("data-theme", "golf");
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
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
  }, [user, leagueId, navigate, location.pathname, isSuperAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const subDisabled = !leagueId || leagueId === "undefined";

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      <div
        className={`bg-primary text-gray-300 border-r transition-all duration-300 ${
          isOpen ? "w-48 md:w-56" : "w-16 md:w-20"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-3 md:p-4 border-base-300 flex items-center justify-between">
          {isOpen && (
            <h1 className="text-lg font-bold text-primary-content hidden md:block">
              Midnight Links
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-base-200 rounded-lg transition"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 md:px-3 space-y-1 overflow-y-auto">
          <Section section="Leagues" />
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
            icon={<BookOpen size={19} />}
            isActive={location.pathname === "/courses" || location.pathname.startsWith("/courses/")}
            collapsed={!isOpen}
          />
          <Section section={league?.name || "League"} />
          {isAdmin && (
            <NavLink
              to={`/league/${leagueId}/admin`}
              text="Admin"
              icon={<TicketCheck size={19} />}
              isActive={location.pathname === `/league/${leagueId}/admin`}
              disabled={subDisabled}
            />
          )}
          <NavLink
            to={`/league/${leagueId}/player/${playerId}`}
            text="Player Dashboard"
            icon={<PanelsTopLeft size={19} />}
            isActive={location.pathname === `/league/${leagueId}/player/${playerId}`}
            disabled={subDisabled || !playerId}
          />
          <NavLink
            to={`/league/${leagueId}`}
            text="League"
            icon={<LayoutDashboard size={19} />}
            isActive={location.pathname === `/league/${leagueId}`}
            disabled={subDisabled}
          />
          <NavLink
            to={`/league/${leagueId}/players`}
            text="Players"
            icon={<Users size={19} />}
            isActive={location.pathname === `/league/${leagueId}/players`}
            disabled={subDisabled}
          />
          {!isTournamentLeague && (
            <NavLink
              to={`/league/${leagueId}/teams`}
              text="Teams"
              icon={<ShieldHalf size={19} />}
              isActive={location.pathname === `/league/${leagueId}/teams`}
              disabled={subDisabled}
            />
          )}
          <NavLink
            to={`/league/${leagueId}/schedule`}
            text="Schedule"
            icon={<Calendar size={19} />}
            isActive={location.pathname === `/league/${leagueId}/schedule`}
            disabled={subDisabled}
          />
          {!subDisabled && (
            <NavWithSubLinks section="Events" links={evs} icon={<LandPlot size={18} />} />
          )}

          {isSuperAdmin && (
            <>
              <Section section="Super Admin" />
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
        <div className="p-2 md:p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-2 py-1 rounded-lg w-full text-gray-400 hover:bg-base-200 transition-colors"
          >
            {isOpen && (
              <div className="flex flex-col gap-3">
                {/* <div className="text-sm flex gap-3 items-center">
                  <CircleQuestionMark size={19} />
                  <span>Support</span>
                </div> */}
                <div className="text-sm flex gap-3 items-center">
                  <LogOut size={19} />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sticky top-0 z-10 bg-base-100 border-b border-gray-300 px-4 md:px-6 py-4 flex justify-end">
          <div className="flex items-center gap-2">
            <User size={22} className="text-blue-600 bg-gray-200 p-0.5 rounded-full" />
            <h2 className="text-sm font-bold text-neutral">
              {user.firstName} {user.lastName}
            </h2>
          </div>
        </div>
        <div className="px-8 py-8 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
