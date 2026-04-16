import { createBrowserRouter } from "react-router";
import BaseLayout from "./layouts/BaseLayout.tsx";

// auth pages
import Login from "./pages/auth/Login.tsx";

// league pages
import League from "./pages/league/League.tsx";
import Leagues from "./pages/league/Leagues.tsx";
import Player from "./pages/player/Player.tsx";
import Players from "./pages/player/Players.tsx";
import Team from "./pages/team/Team.tsx";
import Teams from "./pages/team/Teams.tsx";
import Event from "./pages/event/Event.tsx";
import Events from "./pages/event/Events.tsx";
import Schedule from "./pages/schedule/Schedule.tsx";
import CreateLeague from "./pages/league/CreateLeague.tsx";
import CreateEvent from "./pages/event/CreateEvent.tsx";
import SingleEvent from "./pages/event/builder/single/SingleEvent.tsx";
import MultipleEvents from "./pages/event/builder/multiple/MultipleEvents.tsx";
import ScoresForm from "./pages/scores/ScoresForm.tsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "",
    element: <BaseLayout />,
    children: [
      { path: "leagues", element: <Leagues /> },
      { path: "leagues/create", element: <CreateLeague /> },
      { path: "league/:leagueId", element: <League /> },
      // players
      { path: "league/:leagueId/players", element: <Players /> },
      { path: "league/:leagueId/player/:playerId", element: <Player /> },
      // teams
      { path: "league/:leagueId/teams", element: <Teams /> },
      { path: "league/:leagueId/team/:teamId", element: <Team /> },
      // events
      { path: "league/:leagueId/events/create", element: <CreateEvent /> },
      {
        path: "league/:leagueId/events/create/single",
        element: <SingleEvent />,
      },
      {
        path: "league/:leagueId/events/create/multi",
        element: <MultipleEvents />,
      },
      { path: "league/:leagueId/events", element: <Events /> }, // schedule
      { path: "league/:leagueId/events/:eventId", element: <Event /> },
      { path: "league/:leagueId/events/:eventId/edit", element: <Event editMode /> },
      { path: "league/:leagueId/events/:eventId/scores", element: <ScoresForm /> },
      { path: "league/:leagueId/schedule", element: <Schedule /> },
    ],
  },

  // {
  //   path: "/superadmin",
  //   element: <BaseLayout />,
  //   children: [
  //     { index: true, element: <div>Admin Home Page</div> },
  //     { path: "leagues", element: <SuperAdminLeagues /> },
  //   ],
  // },
  // {
  //   path: "/admin",
  //   element: <BaseLayout />,
  //   children: [
  //     { path: "dashboard", element: <AdminDashboard /> },
  //     { path: "league/create", element: <CreateLeague /> },
  //     { path: "league/:leagueId", element: <AdminLeague /> },
  //     { path: "league/:leagueId/events", element: <div>Admin Events List</div> },
  //     { path: "league/:leagueId/events/:eventId", element: <div>Admin Single Event</div> },
  //     { path: "league/:leagueId/events/:eventId/scores", element: <div>Admin Event Scores</div> },
  //     { path: "league/:leagueId/events/create", element: <CreateEvent /> },
  //     { path: "league/:leagueId/events/create/single", element: <SingleEvent /> },
  //     { path: "league/:leagueId/events/create/multiple", element: <MultipleEvents /> },
  //   ],
  // },
  // {
  //   path: "",
  //   element: <BaseLayout />,
  //   children: [
  //     { path: "dashboard", element: <Dashboard /> },
  //     { path: "league/:leagueId", element: <League /> },
  //     { path: "league/:leagueId/players", element: <Players /> },
  //     { path: "league/:leagueId/player/:playerId", element: <Player /> },
  //     { path: "league/:leagueId/teams", element: <Teams /> },
  //     { path: "league/:leagueId/schedule", element: <Schedule /> },
  //     { path: "league/:leagueId/event/:eventId", element: <Event /> },
  //   ],
  // },
]);
