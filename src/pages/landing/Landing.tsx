import { BILLING_MIN_GOLFERS, BILLING_PRICE_PER_GOLFER, formatBillingPrice } from "@/lib/billing";
import {
  ArrowRight,
  Activity,
  BrainCircuit,
  Check,
  ChevronRight,
  ClipboardList,
  Flag,
  Gauge,
  LineChart,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import lnLogo from "@/assets/league-night-logo.png";
import { publicLinks } from "@/config/publicLinks";
import { SCORING_MODES } from "@/features/scoring/scoringModes";

const RegisterPanel = lazy(() => import("./components/RegisterPanel"));

const GOLF_IMAGES = {
  hero: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=76",
  aerial:
    "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=76",
};

const stats = [
  { value: "8 formats", label: "Individual and team scoring built in" },
  { value: "One entry", label: "Scores update results, points, skins, and standings" },
  { value: "Full history", label: "Renew each season without losing league records" },
];

const workflow = [
  {
    title: "League administration",
    body: "Manage golfers, substitutes, teams, invitations, announcements, scoring rules, and renewals.",
    icon: <Flag size={18} />,
  },
  {
    title: "Event execution",
    body: "Schedule rounds, select courses and tees, build flights and matchups, print cards, and handle substitutions.",
    icon: <ClipboardList size={18} />,
  },
  {
    title: "Scoring and competition",
    body: "Enter scores once to calculate net results, points, skins, standings, records, and performance insights.",
    icon: <Trophy size={18} />,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f7fb] text-[#101828]">
      <style>{`
        @keyframes landing-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-reveal { animation: landing-fade-up 780ms cubic-bezier(.2,.8,.2,1) both; }
        .landing-delay-1 { animation-delay: 120ms; }
        .landing-delay-2 { animation-delay: 240ms; }
        .landing-delay-3 { animation-delay: 360ms; }
        .landing-deferred-section {
          content-visibility: auto;
          contain-intrinsic-size: auto 800px;
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-reveal {
            animation: none;
          }
        }
      `}</style>

      <Hero />
      <main>
        <ProductSection />
        <IntelligenceSection />
        <WorkflowSection />
        <PricingSection />
        <RegistrationSection />
        <LandingFooter />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#071426] text-white">
      <img
        src={`${GOLF_IMAGES.hero}&w=1800`}
        srcSet={`${GOLF_IMAGES.hero}&w=720 720w, ${GOLF_IMAGES.hero}&w=1200 1200w, ${GOLF_IMAGES.hero}&w=1800 1800w`}
        sizes="100vw"
        alt="Golf course fairway at sunset"
        width={1800}
        height={1200}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-58"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,.28),transparent_26%),linear-gradient(115deg,rgba(7,20,38,.98)_0%,rgba(7,20,38,.78)_48%,rgba(7,20,38,.34)_100%)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <img src={lnLogo} alt="League Night Pro" className="h-20" />
          <div>
            <p className="text-sm font-black tracking-wide">League Night</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Golf League Management
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 rounded-full border border-white/10 bg-slate-950/45 px-5 py-2 text-xs font-bold text-white/70 md:flex">
          <a href="#product" className="hover:text-white">
            Product
          </a>
          <a href="#intelligence" className="hover:text-white">
            Intelligence
          </a>
          <a href="#workflow" className="hover:text-white">
            Season flow
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full border border-white/15 bg-slate-950/35 px-4 py-2 text-xs font-black text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Sign in
          </Link>
          <a
            href="#register"
            className="rounded-full bg-sky-300 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-200"
          >
            Start
          </a>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:pb-28 lg:pt-20">
        <div>
          <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-slate-950/40 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-sky-100">
            <Trophy size={13} />
            One system for the entire golf league season
          </div>

          <h1 className="landing-reveal landing-delay-1 mt-6 max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.065em] text-white md:text-7xl">
            Run your golf league without spreadsheet chaos.
          </h1>

          <p className="landing-reveal landing-delay-2 mt-7 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            Manage players, schedules, flights, scorecards, formats, standings, and season renewals—then
            turn every score into useful player, team, and league insight.
          </p>

          <div className="landing-reveal landing-delay-3 mt-8 flex flex-wrap gap-3">
            <a
              href="#register"
              className="group inline-flex items-center gap-2 rounded-full bg-sky-300 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-sky-950/25 transition hover:bg-sky-200"
            >
              Start your league
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/35 px-5 py-3 text-sm font-black text-white transition hover:bg-white/12"
            >
              See what it handles
              <ChevronRight size={16} />
            </a>
          </div>

          <div className="landing-reveal landing-delay-3 mt-10 hidden max-w-2xl grid-cols-3 gap-3 md:grid">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-slate-950/40 p-4"
              >
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-white/52">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <HeroProductCard />
      </div>
    </section>
  );
}

function HeroProductCard() {
  return (
    <div className="landing-reveal landing-delay-2 relative hidden lg:block">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(125,211,252,.22),transparent_70%)]" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-slate-900/75 p-3 shadow-2xl shadow-black/30">
        <div className="rounded-[1.5rem] bg-[#f8fafc] text-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                League intelligence
              </p>
              <h2 className="text-base font-black">Thursday League Pulse</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-800">
              season active
            </span>
          </div>

          <div className="grid gap-3 p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                ["92%", "Participation"],
                ["8 / 12", "Events"],
                ["1.5", "Lead gap"],
                ["3", "Hot golfers"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-lg font-black tracking-tight">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <BrainCircuit size={15} className="text-emerald-300" />
                <p className="text-sm font-black">What needs attention</p>
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ["Standings race", "Only 1.5 points separate first and second."],
                  ["Participation", "Three golfers trail the league pace by two rounds."],
                  ["Next matchup", "Course history favors Avery by 2.3 net strokes."],
                ].map(([title, body], index) => (
                  <div key={title} className="flex gap-3 rounded-2xl bg-white/[0.07] px-3 py-2.5">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${index === 1 ? "bg-amber-400" : "bg-sky-300"}`} />
                    <div>
                      <p className="text-xs font-black">{title}</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-white/55">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["Player", "Improve · Compete · Progress"],
                ["League", "Race · Performance · Rivalries"],
                ["Event", "Results · Story · Battles"],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center"
                >
                  <p className="text-xs font-black">{title}</p>
                  <p className="mt-0.5 text-[9px] leading-3 text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSection() {
  const scoringModes = Object.values(SCORING_MODES);

  return (
    <section id="product" className="landing-deferred-section relative overflow-hidden bg-[#f4f7fb] px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="landing-reveal">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
            Everything the commissioner runs
          </p>
          <h2 className="mt-4 max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            Everything a commissioner needs to run the season.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Set up the league, run each event, enter scores once, and keep every result and standing connected.
          </p>

          <div className="mt-8 grid gap-3">
            {workflow.map((item, index) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-black/5 bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sky-200 transition group-hover:rotate-3">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-blue-900/10 blur-2xl" />
          <div className="relative grid gap-4 lg:grid-cols-[1fr_0.74fr]">
            <div className="hidden overflow-hidden rounded-[2rem] bg-slate-950 p-3 shadow-2xl shadow-blue-950/18 lg:block">
              <img
                src={`${GOLF_IMAGES.aerial}&w=1100`}
                srcSet={`${GOLF_IMAGES.aerial}&w=560 560w, ${GOLF_IMAGES.aerial}&w=800 800w, ${GOLF_IMAGES.aerial}&w=1100 1100w`}
                sizes="(min-width: 1024px) 42vw, 100vw"
                alt="Aerial view of a golf course fairway"
                width={1100}
                height={733}
                loading="lazy"
                decoding="async"
                className="h-72 w-full rounded-[1.45rem] object-cover opacity-90"
              />
              <div className="p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-200">
                  Weekly event workflow
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">
                  Build flights, print cards, enter scores, and publish the results.
                </h3>
              </div>
            </div>

            <ScoreToInsightCards />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-800">
                  Flexible event scoring
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Use the format your league actually plays.
                </h3>
              </div>
              <p className="max-w-lg text-sm leading-6 text-slate-600">
                Run individual and team events in the same season, with configurable handicap
                allowances, placement points, match points, and Stableford values.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {scoringModes.map((mode) => (
                <div
                  key={mode.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3"
                >
                  <Check size={15} className="shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-black text-slate-950">{mode.label}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {mode.models.length === 2 ? "Individual + team" : "Team"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreToInsightCards() {
  const steps = [
    {
      label: "Capture",
      title: "Hole-by-hole scoring",
      body: "Record each golfer's gross scores once.",
      icon: <ClipboardList size={16} />,
    },
    {
      label: "Calculate",
      title: "Every league result",
      body: "Net, points, skins, standings, and records update together when a score changes.",
      icon: <Gauge size={16} />,
    },
    {
      label: "Explain",
      title: "The story behind it",
      body: "Reveal round drama, player progress, recent performance, and rivalries.",
      icon: <BrainCircuit size={16} />,
    },
  ];

  return (
    <div className="grid gap-4">
      {steps.map((step, index) => (
        <article
          key={step.label}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg shadow-blue-950/6"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-emerald-200">
              {step.icon}
            </span>
            <span className="text-[9px] font-black tabular-nums text-slate-300">
              0{index + 1}
            </span>
          </div>
          <p className="mt-4 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">
            {step.label}
          </p>
          <h3 className="mt-1 text-base font-black tracking-tight text-slate-950">{step.title}</h3>
          <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{step.body}</p>
        </article>
      ))}
    </div>
  );
}

function IntelligenceSection() {
  const views = [
    {
      title: "League Pulse",
      body: "Track the live race, who's hot or cooling off, recent winners, category leaders, skins, awards, and rivalry pressure.",
      result: "See the complete state of the league at a glance.",
      icon: <Activity size={17} />,
    },
    {
      title: "Player Intelligence",
      body: "Give every golfer focused Improve, Compete, and Progress views covering scoring patterns, course splits, recent performance, records, rankings, and head-to-head history.",
      result: "Show each golfer what to work on and how they stack up.",
      icon: <LineChart size={17} />,
    },
    {
      title: "Team DNA",
      body: "Track team scoring, player contribution, recent performance, scoring identity, matchup records, and season rivalries.",
      result: "See why a team is winning—not only where it ranks.",
      icon: <Users size={17} />,
    },
    {
      title: "Event Recap",
      body: "Move between results, the round story, performance awards, decisive holes, bounce-backs, matchups, and skins without losing the full score data.",
      result: "Turn every completed event into a story worth checking.",
      icon: <Trophy size={17} />,
    },
    {
      title: "Matchup Preview",
      body: "Compare handicap, recent net averages, head-to-head record, and course history before assigned players meet.",
      result: "Make the next event interesting before the first tee shot.",
      icon: <Swords size={17} />,
    },
    {
      title: "Commissioner Operations Check",
      body: "Flag missing scores, incomplete matchups, participation gaps, paid-capacity issues, schedule breaks, and renewal deadlines.",
      result: "Find the work that needs attention before golfers do.",
      icon: <ShieldCheck size={17} />,
    },
  ];

  return (
    <section id="intelligence" className="landing-deferred-section relative overflow-hidden bg-white px-5 py-24 md:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />
      <div className="mx-auto max-w-7xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800">
            <BrainCircuit size={13} />
            League Night Intelligence
          </div>
          <h2 className="mt-5 max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            Your scores should explain the league—not just fill a table.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {views.map((view, index) => (
            <article
              key={view.title}
              className={`group rounded-[1.75rem] border p-5 transition hover:-translate-y-1 hover:shadow-xl ${
                index > 3 ? "hidden md:block " : ""
              }${
                index === 0
                  ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-950/15"
                  : "border-slate-200 bg-[#f8fafc] text-slate-950"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                index === 0 ? "bg-emerald-300 text-slate-950" : "bg-slate-950 text-emerald-200"
              }`}>
                {view.icon}
              </div>
              <h3 className="mt-5 text-lg font-black">{view.title}</h3>
              <p className={`mt-2 text-sm leading-6 ${index === 0 ? "text-white/60" : "text-slate-600"}`}>
                {view.body}
              </p>
              <div className={`mt-5 border-t pt-4 text-xs font-black ${
                index === 0 ? "border-white/10 text-emerald-200" : "border-slate-200 text-blue-800"
              }`}>
                {view.result}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="landing-deferred-section hidden bg-[#101828] px-5 py-24 text-white md:block md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
              One continuous season record
            </p>
            <h2 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.055em]">
              Set it up once. Run each week. Carry the league into next season.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/58">
            Renew from the previous season with the same golfers and historical rounds—without rebuilding the league.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["01", "Create", "Set season dates, golfers, substitutes, teams, formats, and scoring rules."],
            ["02", "Schedule", "Create recurring events, select courses and tees, then assign flights and matchups."],
            ["03", "Run", "Print scorecards, handle swaps, enter gross scores, and calculate net, points, and skins."],
            ["04", "Publish", "Release event stories, standings, league pulse, player and team intelligence, and member announcements."],
            ["05", "Renew", "Create the next season from the prior league while preserving players and legacy rounds."],
          ].map(([step, title, body]) => (
            <div
              key={step}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]"
            >
              <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,.15),transparent_70%)] transition group-hover:opacity-80" />
              <p className="text-[10px] font-black text-sky-300">{step}</p>
              <h3 className="mt-10 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegistrationSection() {
  return (
    <section id="register" className="landing-deferred-section relative scroll-mt-6 overflow-hidden bg-[#f4f7fb] px-5 py-24 md:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-black/5" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="hidden rounded-[2.25rem] bg-slate-950 p-7 text-white shadow-2xl shadow-blue-950/15 lg:block lg:p-9">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
            Start the league
          </p>
          <h2 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.05em]">
            Create the admin account, verify the email, and build the first season.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">
            Account creation is free. Payment is based on the regular-golfer roster when the league
            is created; substitutes do not add to the price.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              ["1", "Create and verify the admin account"],
              ["2", "Set the league dates, format, players, teams, and scoring rules"],
              ["3", "Purchase the season and begin scheduling events"],
            ].map(([step, text]) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-300 text-xs font-black text-slate-950">
                  {step}
                </span>
                <p className="text-sm font-bold text-white/85">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <DeferredRegisterPanel />
      </div>
    </section>
  );
}

function PricingSection() {
  const includedTotal = formatBillingPrice(BILLING_PRICE_PER_GOLFER * BILLING_MIN_GOLFERS);

  return (
    <section id="pricing" className="landing-deferred-section bg-white px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
            Per-season pricing
          </p>
          <h2 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            One clear price for one complete league season.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Start with {BILLING_MIN_GOLFERS} regular golfers for {includedTotal}. Additional regular golfers
            are {formatBillingPrice(BILLING_PRICE_PER_GOLFER)} each per season, and substitutes are free.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-6">
            <p className="text-sm font-black text-slate-950">League season minimum</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tight">{includedTotal}</span>
              <span className="mb-2 text-sm font-bold text-slate-500">
                / season minimum
              </span>
            </div>
            <div className="mt-8 grid gap-3">
              {[
                "Admin account included",
                `${BILLING_MIN_GOLFERS}-golfer league minimum`,
                "All league, event, scoring, and intelligence features",
                "Substitutes do not count toward billing",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <Check size={15} className="text-blue-700" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <div className="flex flex-col justify-between gap-8 md:flex-row">
              <div>
                <p className="text-sm font-black">Per additional regular golfer</p>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/58">
                  Add regular players in batches and pay only for capacity above that league&apos;s
                  current paid roster. Substitutes remain free.
                </p>
              </div>
              <div className="shrink-0 rounded-3xl bg-sky-300 px-6 py-5 text-slate-950">
                <p className="text-5xl font-black tracking-tight">
                  {formatBillingPrice(BILLING_PRICE_PER_GOLFER)}
                </p>
                <p className="text-xs font-black uppercase tracking-wide">per league season</p>
              </div>
            </div>

            <a
              href="#register"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-100"
            >
              Create your admin account
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeferredRegisterPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="min-h-[560px] lg:sticky lg:top-6">
      {shouldLoad ? (
        <Suspense
          fallback={
            <div className="min-h-[560px] rounded-[2rem] border border-slate-200 bg-white" />
          }
        >
          <RegisterPanel />
        </Suspense>
      ) : (
        <div className="min-h-[560px] rounded-[2rem] border border-slate-200 bg-white" />
      )}
    </div>
  );
}

function LandingFooter() {
  const year = new Date().getFullYear();
  const policyLinks = [
    { label: "Privacy", href: publicLinks.privacy },
    { label: "Terms", href: publicLinks.terms },
    { label: "Refunds", href: publicLinks.refunds },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer className="border-t border-white/10 bg-[#071426] px-5 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src={lnLogo} alt="League Night" className="h-12" />
          <p>© {year} League Night LLC. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 font-bold text-sky-200">
          {publicLinks.supportEmail && (
            <a
              href={`mailto:${publicLinks.supportEmail}`}
              className="transition hover:text-white"
            >
              Support
            </a>
          )}
          {policyLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
          <Link to="/login" className="transition hover:text-white">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
