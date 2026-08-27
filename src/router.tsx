import { createBrowserRouter } from "react-router";
import { lazy, Suspense, type ReactNode } from "react";
import Landing from "./pages/landing/Landing.tsx";

// auth pages
import AppErrorBoundary from "@/components/route/AppErrorBoundary";
import LeagueRouteGuard from "@/components/route/LeagueRouteGuard";

const Login = lazy(() => import("./pages/auth/Login.tsx"));
const BaseLayout = lazy(() => import("./layouts/BaseLayout.tsx"));
const League = lazy(() => import("./pages/league/League.tsx"));
const Leagues = lazy(() => import("./pages/league/Leagues.tsx"));
const Player = lazy(() => import("./pages/player/Player.tsx"));
const Players = lazy(() => import("./pages/player/Players.tsx"));
const Team = lazy(() => import("./pages/team/Team.tsx"));
const Teams = lazy(() => import("./pages/team/Teams.tsx"));
const Event = lazy(() => import("./pages/event/Event.tsx"));
const Schedule = lazy(() => import("./pages/schedule/Schedule.tsx"));
const CreateLeague = lazy(() => import("./pages/league/CreateLeague.tsx"));
const EditLeague = lazy(() => import("./pages/league/EditLeague.tsx"));
const SingleEvent = lazy(() => import("./pages/event/create/CreateEvent.tsx"));
const EventScores = lazy(() => import("./pages/scores/EventScores.tsx"));
const PrintFlightScorecards = lazy(() => import("./pages/scores/PrintFlightScorecards.tsx"));
const EventEdit = lazy(() => import("./pages/event/EventEdit.tsx"));
const LeagueAdmin = lazy(() => import("./pages/league/LeagueAdmin.tsx"));
const Course = lazy(() => import("./pages/course/Course.tsx"));
const Courses = lazy(() => import("./pages/course/Courses.tsx"));
const CoursesAdmin = lazy(() => import("@/pages/superadmin/CoursesAdmin"));
const LeaguesAdmin = lazy(() => import("@/pages/superadmin/LeaguesAdmin"));
const BillingAdmin = lazy(() => import("@/pages/superadmin/BillingAdmin"));
const ContactSupport = lazy(() => import("./pages/support/ContactSupport.tsx"));
const InviteClaim = lazy(() => import("./pages/invite/InviteClaim.tsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.tsx"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail.tsx"));
const AppThemeProvider = lazy(() => import("./components/route/AppThemeProvider.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService.tsx"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy.tsx"));

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading...</div>}>
    {element}
  </Suspense>
);

const withAppTheme = (element: ReactNode) =>
  withSuspense(<AppThemeProvider>{element}</AppThemeProvider>);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/login",
    element: withAppTheme(<Login />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/invite/:token",
    element: withAppTheme(<InviteClaim />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/forgot-password",
    element: withAppTheme(<ForgotPassword />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/reset-password",
    element: withAppTheme(<ResetPassword />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/verify-email",
    element: withAppTheme(<VerifyEmail />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/privacy",
    element: withAppTheme(<PrivacyPolicy />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/terms",
    element: withAppTheme(<TermsOfService />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "/refunds",
    element: withAppTheme(<RefundPolicy />),
    errorElement: <AppErrorBoundary />,
  },
  {
    path: "",
    element: withAppTheme(<BaseLayout />),
    errorElement: <AppErrorBoundary />,
    children: [
      { path: "leagues", element: withSuspense(<Leagues />), errorElement: <AppErrorBoundary /> },
      { path: "courses", element: withSuspense(<Courses />), errorElement: <AppErrorBoundary /> },
      { path: "courses/:courseId", element: withSuspense(<Course />), errorElement: <AppErrorBoundary /> },
      { path: "support", element: withSuspense(<ContactSupport />), errorElement: <AppErrorBoundary /> },
      {
        element: <LeagueRouteGuard />,
        errorElement: <AppErrorBoundary />,
        children: [
          { path: "league/:leagueId", element: withSuspense(<League />) },
          { path: "league/:leagueId/players", element: withSuspense(<Players />) },
          { path: "league/:leagueId/player/:playerId", element: withSuspense(<Player />) },
          { path: "league/:leagueId/teams", element: withSuspense(<Teams />) },
          { path: "league/:leagueId/team/:teamId", element: withSuspense(<Team />) },
          { path: "league/:leagueId/events/:eventId", element: withSuspense(<Event />) },
          { path: "league/:leagueId/schedule", element: withSuspense(<Schedule />) },
        ],
      },
      {
        element: <LeagueRouteGuard adminOnly />,
        errorElement: <AppErrorBoundary />,
        children: [
          { path: "leagues/create", element: withSuspense(<CreateLeague />) },
          { path: "league/:leagueId/edit", element: withSuspense(<EditLeague />) },
          { path: "league/:leagueId/admin", element: withSuspense(<LeagueAdmin />) },
          { path: "league/:leagueId/events/create", element: withSuspense(<SingleEvent />) },
          { path: "league/:leagueId/events/:eventId/edit", element: withSuspense(<EventEdit />) },
          {
            path: "league/:leagueId/events/:eventId/scores",
            element: withSuspense(<EventScores />),
          },
        ],
      },
      {
        element: <LeagueRouteGuard superAdminOnly />,
        errorElement: <AppErrorBoundary />,
        children: [
          { path: "superadmin/courses", element: withSuspense(<CoursesAdmin />) },
          { path: "superadmin/leagues", element: withSuspense(<LeaguesAdmin />) },
          { path: "superadmin/billing", element: withSuspense(<BillingAdmin />) },
        ],
      },
    ],
  },
  {
    element: <LeagueRouteGuard adminOnly />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        path: "league/:leagueId/events/:eventId/print-scorecards",
        element: withAppTheme(<PrintFlightScorecards />),
      },
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
