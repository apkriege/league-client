import { Link, Outlet, useNavigate, useLocation } from "react-router";
import ThemeSwitcher from "../components/layout/ThemeSwitcher";
import { logout } from "@api/auth";
import { useAppStore } from "@/stores/appStore";
import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  LandPlot,
  PanelsTopLeft,
  ShieldHalf,
  ShieldPlus,
  TicketCheck,
  TvMinimal,
  User,
  Users,
} from "lucide-react";
import { useAdminLeagues, useLeagueEvents, useLeagues } from "@api/league/queries";
import dayjs from "dayjs";
import { useUserLeagues } from "@api/users/queries";
import { Select } from "@/components/form";

const Section = ({ section }: { section: string }) => (
  <div className="mt-5 mb-1 flex flex-col">
    <p className="text-[10px] uppercase ml-2 font-semibold text-base-content/50">{section}</p>
  </div>
);

const NavLink = ({
  to,
  text,
  icon,
  isActive,
}: {
  to: string;
  text: string;
  icon: any;
  isActive: boolean;
}) => {
  return (
    <Link
      to={to}
      className={`px-2 py-1 rounded hover:bg-primary/80 hover:text-primary-content transition-colors flex items-center ${
        isActive ? "bg-primary/80 text-primary-content" : ""
      }`}
    >
      <span className="mr-2">{icon}</span>
      <span className="text-sm">{text}</span>
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
                  {link.name}
                  <span className="ml-2 text-[10px] text-base-content/50">
                    {dayjs(link.date).format("MM/DD/YY")}
                  </span>
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
    to: `/league/${event.leagueId}/event/${event.id}/scores`,
    completed: event.completed,
    eventType: event.eventType,
  }));
};

export default function BaseLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { user, leagueId, clearLeagueId } = useAppStore();

  const { data: adminLeagues } = useAdminLeagues();
  const { data: leagues } = useUserLeagues(user?.id || 0);

  let options = [];
  if (user.role === "ADMIN" && adminLeagues) {
    options = adminLeagues.map((league: any) => ({
      value: league.id,
      label: league.name,
    }));
  } else if (leagues) {
    options = leagues.map((league: any) => ({
      value: league.id,
      label: league.name,
    }));
  }

  const { data: events } = useLeagueEvents(leagueId);
  const evs = events ? modelEvents(events) : [];

  useEffect(() => {
    // Set the golf theme on mount
    document.documentElement.setAttribute("data-theme", "golf");
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }

    if (!leagueId) {
      navigate("/dashboard");
    }
  }, [user, leagueId, navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen bg-base-300">
      {/* Sidebar */}
      <div
        className={`bg-base-200 border-r border-gray-300 transition-all duration-300 ${
          isOpen ? "min-w-50" : "w-20"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-base-300 flex items-center justify-between">
          {isOpen && <h1 className="text-lg font-bold text-primary">League</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-base-200 rounded-lg transition"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className="px-2">
          <Select
            value={leagueId || ""}
            label={isOpen ? "Select League" : ""}
            options={options}
            onChange={(e) => {
              useAppStore.getState().setLeagueId(Number(e.target.value));
            }}
            className=""
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {user.role === "ADMIN" && (
            <>
              <Section section="Admin" />
              <NavLink
                to="/admin/league/create"
                text="Create League"
                icon={<ShieldPlus size={18} />}
                isActive={location.pathname === "/admin/league/create"}
              />
              <NavLink
                to={`/admin/league/${leagueId}`}
                text="League"
                icon={<TicketCheck size={18} />}
                isActive={location.pathname === "/admin/leagues/:id"}
              />
              <NavLink
                to="/admin/dashboard"
                text="Dashboard"
                icon={<TvMinimal size={18} />}
                isActive={location.pathname === "/admin/dashboard"}
              />
            </>
          )}

          <Section section="General" />
          <NavLink
            to="/dashboard"
            text="Dashboard"
            icon={<PanelsTopLeft size={18} />}
            isActive={location.pathname === "/dashboard"}
          />
          <Section section="League" />
          <NavLink
            to={`/league/${leagueId}/players`}
            text="Players"
            icon={<Users size={18} />}
            isActive={location.pathname === `/league/${leagueId}/players`}
          />
          <NavLink
            to={`/league/${leagueId}/teams`}
            text="Teams"
            icon={<ShieldHalf size={18} />}
            isActive={location.pathname === `/league/${leagueId}/teams`}
          />
          <NavLink
            to={`/league/${leagueId}/schedule`}
            text="Schedule"
            icon={<Calendar size={18} />}
            isActive={location.pathname === `/league/${leagueId}/schedule`}
          />
          <NavWithSubLinks section="Events" links={evs} icon={<LandPlot size={18} />} />
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-base-300">
          <button className="flex items-center gap-4 px-2 py-1 rounded-lg w-full text-neutral hover:bg-base-200 transition-colors">
            {isOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10 bg-base-100 border-b border-gray-300 px-6 py-4 flex justify-end">
          <div className="flex items-center gap-2">
            <User size={22} className="text-blue-600 bg-gray-200 p-0.5 rounded-full" />
            <h2 className="text-sm font-bold text-neutral">
              {user.firstName} {user.lastName}
            </h2>
          </div>
        </div>
        <div className="px-6 py-4 overflow-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
