import { createBrowserRouter } from "react-router";
import BaseLayout from "./layouts/BaseLayout.tsx";

// auth pages
import Login from "./pages/auth/Login.tsx";

// super admin pages
import Leagues from "./pages/superadmin/Leagues.tsx";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminLeague from "./pages/admin/AdminLeague.tsx";
import AdminEvent from "./features/admin-league/Event.tsx";
import CreateLeague from "./pages/admin/CreateLeague.tsx";
import AdminEventScores from "./pages/admin/AdminEventScores.tsx";

// user pages
// import Dashboard from "./pages/user/Dashboard.tsx";
// import Players from "./pages/user/Players.tsx";
// import Teams from "./pages/user/Teams.tsx";
// import Schedule from "./pages/user/Schedule.tsx";
// import Scores from "./pages/user/Scores.tsx";
// import Event from "./features/league-creator/admin-league/Event.tsx";
// import Events from "./pages/user/Events.tsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/superadmin",
    element: <BaseLayout />,
    children: [
      {
        index: true,
        element: <div>Admin Home Page</div>,
      },
      {
        path: "leagues",
        element: <Leagues />,
      },
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
      { path: "league/:leagueId/event/:eventId/scores", element: <AdminEventScores /> },
    ],
  },
  {
    path: "",
    element: <BaseLayout />,
    children: [
      // {
      //   path: "/dashboard",
      //   element: <Dashboard />,
      // },
      // {
      //   path: "league/:leagueId",
      //   // element: <League/>,
      //   element: <div>League Dashboard</div>,
      // },
      // {
      //   path: "league/:leagueId/players",
      //   element: <Players />,
      // },
      // {
      //   path: "league/:leagueId/teams",
      //   element: <Teams />,
      // },
      // {
      //   path: "league/:leagueId/events",
      //   element: <Events />,
      // },
      // {
      //   path: "league/:leagueId/event/:eventId/scores",
      //   element: <Scores />,
      // },
      // {
      //   path: "league/:leagueId/schedule",
      //   element: <Schedule />,
      // },
      // {
      //   path: "league/:leagueId/events/:eventId",
      //   element: <Event />,
      // },
    ],
  },
]);
