import { createBrowserRouter } from "react-router";
import BaseLayout from "./layouts/BaseLayout.tsx";

// auth pages
import Login from "./pages/auth/Login.tsx";

// super admin pages
import SuperAdminLeagues from "./pages/superadmin/Leagues.tsx";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminLeague from "./pages/admin/AdminLeague.tsx";
import AdminEvent from "./features/admin-league/Event.tsx";
import CreateLeague from "./pages/admin/CreateLeague.tsx";

// user pages
import Dashboard from "./pages/user/Dashboard.tsx";
import League from "./pages/user/League.tsx";
import Players from "./pages/user/Players.tsx";
import Player from "./pages/user/Player.tsx";
import Teams from "./pages/user/Teams.tsx";
import Event from "./pages/user/Event.tsx";
import Schedule from "./pages/user/Schedule.tsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/superadmin",
    element: <BaseLayout />,
    children: [
      { index: true, element: <div>Admin Home Page</div> },
      { path: "leagues", element: <SuperAdminLeagues /> },
    ],
  },
  {
    path: "/admin",
    element: <BaseLayout />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "league/create", element: <CreateLeague /> },
      { path: "league/:leagueId", element: <AdminLeague /> },
      { path: "league/:leagueId/event/:eventId", element: <AdminEvent /> },
    ],
  },
  {
    path: "",
    element: <BaseLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "league/:leagueId", element: <League /> },
      { path: "league/:leagueId/players", element: <Players /> },
      { path: "league/:leagueId/player/:playerId", element: <Player /> },
      { path: "league/:leagueId/teams", element: <Teams /> },
      { path: "league/:leagueId/schedule", element: <Schedule /> },
      { path: "league/:leagueId/events/:eventId", element: <Event /> },
    ],
  },
]);
