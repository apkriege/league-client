import { BILLING_MIN_GOLFERS, BILLING_PRICE_PER_GOLFER, formatBillingPrice } from "@/lib/billing";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Flag,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import lnLogo from "@/assets/league-night-logo.png";

const RegisterPanel = lazy(() => import("./components/RegisterPanel"));

const GOLF_IMAGES = {
  hero: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=76",
  aerial:
    "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=76",
  detail:
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=76",
};

const stats = [
  { value: "9/18", label: "hole scorecards" },
  { value: "4", label: "event format combinations" },
  { value: "3", label: "leaderboard views" },
];

const workflow = [
  {
    title: "Build the league",
    body: "Create players, teams, flights, and events, then use verified club, course, and tee data.",
    icon: <Flag size={18} />,
  },
  {
    title: "Run the night",
    body: "Print scorecards, enter scores by flight, swap players, and lock completed events.",
    icon: <ClipboardList size={18} />,
  },
  {
    title: "Publish results",
    body: "Share points, low-gross, and low-net leaderboards, skins, player trends, scorecards, and round history.",
    icon: <Trophy size={18} />,
  },
];

const features = [
  {
    title: "League operations",
    body: "Seasons, tournaments, recurring schedules, flights, announcements, invitations, and role-based access.",
    icon: <CalendarDays size={18} />,
  },
  {
    title: "Scoring engine",
    body: "Gross and net scoring, match-play points, skins, printable scorecards, and handicap movement.",
    icon: <Gauge size={18} />,
  },
  {
    title: "Player intelligence",
    body: "Round history, performance trends, handicap movement, and detailed scoring for every player.",
    icon: <LineChart size={18} />,
  },
  {
    title: "Club-ready course data",
    body: "Verified clubs, courses, tees, ratings, slopes, hole details, and timezone-aware scheduling.",
    icon: <Flag size={18} />,
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
        <ProofStrip />
        <ProductSection />
        <WorkflowSection />
        <FeatureSection />
        <ConversionSection />
        <PricingSection />
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
          <a href="#workflow" className="hover:text-white">
            Workflow
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
            <Sparkles size={13} />
            Golf league operations for organizers and clubs
          </div>

          <h1 className="landing-reveal landing-delay-1 mt-6 max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.065em] text-white md:text-7xl">
            Run league night like a professional operation.
          </h1>

          <p className="landing-reveal landing-delay-2 mt-7 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            League Night Pro gives organizers and clubs one focused golf league operating system:
            scheduling, scorecards, teams, flights, leaderboards, skins, announcements, handicap
            tracking, and player history.
          </p>

          <div className="landing-reveal landing-delay-3 mt-8 flex flex-wrap gap-3">
            <a
              href="#register"
              className="group inline-flex items-center gap-2 rounded-full bg-sky-300 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-sky-950/25 transition hover:bg-sky-200"
            >
              Launch your league
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/35 px-5 py-3 text-sm font-black text-white transition hover:bg-white/12"
            >
              See the system
              <ChevronRight size={16} />
            </a>
          </div>

          <div className="landing-reveal landing-delay-3 mt-10 grid max-w-2xl grid-cols-3 gap-3">
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
    <div className="landing-reveal landing-delay-2 relative">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(125,211,252,.22),transparent_70%)]" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-slate-900/75 p-3 shadow-2xl shadow-black/30">
        <div className="rounded-[1.5rem] bg-[#f8fafc] text-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Live event
              </p>
              <h2 className="text-base font-black">Thursday Match Play</h2>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black text-blue-800">
              scoring
            </span>
          </div>

          <div className="grid gap-3 p-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["6/8", "Flights"],
                ["42", "Players"],
                ["12", "Skins"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-2xl font-black tracking-tight">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={15} className="text-sky-300" />
                  <p className="text-sm font-black">Event leaderboard</p>
                </div>
                <p className="text-[10px] font-bold text-white/42">RESULTS</p>
              </div>
              <div className="flex h-32 items-end gap-3">
                {[42, 58, 35, 74, 64, 88, 53, 78].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-xl ${
                        index === 5 ? "bg-sky-300" : "bg-white/18"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="h-1 w-3 rounded-full bg-white/18" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              {[
                ["Scorecards ready", "9 or 18-hole event scorecards"],
                ["Handicaps locked", "pre-round values preserved"],
                ["Skins calculated", "ties excluded automatically"],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-blue-800">
                    <Check size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-black">{title}</p>
                    <p className="text-[10px] text-slate-500">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="landing-deferred-section relative border-b border-black/5 bg-[#f4f7fb]">
      <div className="mx-auto grid max-w-7xl gap-3 px-5 py-6 md:grid-cols-4 md:px-8">
        {[
          "Course and tee database",
          "Team and individual seasons",
          "Match play and stroke scoring",
          "Role-protected admin controls",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3">
            <CircleCheck size={15} className="text-blue-700" />
            <span className="text-xs font-black text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="product" className="landing-deferred-section relative overflow-hidden bg-[#f4f7fb] px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="landing-reveal">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
            Built for real league workflows
          </p>
          <h2 className="mt-4 max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            Less spreadsheet chaos. More control from first tee to final standings.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            The app is structured around the way golf leagues actually operate: weekly events,
            flights, scorecards, player substitutions, matchups, skins, standings, and player
            history that updates as the season progresses.
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
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-3 shadow-2xl shadow-blue-950/18">
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
                  Event command center
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">
                  Every flight, card, score, and matchup in one flow.
                </h3>
              </div>
            </div>

            <div className="grid gap-4">
              <MetricCard label="League access" value="Login or code" icon={<ShieldCheck size={16} />} />
              <MetricCard label="Leaderboards" value="3 views" icon={<BarChart3 size={16} />} />
              <MetricCard label="Scheduling" value="Timezone-safe" icon={<CalendarDays size={16} />} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-xl shadow-blue-950/8">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-blue-800">
        {icon}
      </div>
      <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="landing-deferred-section bg-[#101828] px-5 py-24 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
              Modern league ops
            </p>
            <h2 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.055em]">
              A calm control room for a messy weekly operation.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/58">
            Keep your workflow clear even when players swap late, formats change, and multiple
            flights need scores entered fast.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {[
            ["01", "Configure", "Teams, players, event rules, point tables, and verified course data."],
            ["02", "Print", "Two-per-page scorecards with player handicaps and event details."],
            ["03", "Score", "Enter by flight, preserve order, calculate points, net, and skins."],
            ["04", "Review", "Publish event scorecards, standings, player pages, and trends."],
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

function FeatureSection() {
  return (
    <section className="landing-deferred-section relative overflow-hidden bg-white px-5 py-20 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
            Product depth
          </p>
          <h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Serious functionality without a heavy admin experience.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Clear permissions, accurate scoring, revocable viewer access, and league data that
            updates when scores are finalized.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="rounded-[1.75rem] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/8"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sky-200">
                {feature.icon}
              </div>
              <h3 className="text-lg font-black text-slate-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConversionSection() {
  return (
    <section className="landing-deferred-section relative overflow-hidden bg-[#f4f7fb] px-5 py-24 md:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-black/5" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="overflow-hidden rounded-[2.25rem] bg-slate-950 p-3 shadow-2xl shadow-blue-950/15">
          <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-80 overflow-hidden rounded-[1.65rem]">
              <img
                src={`${GOLF_IMAGES.detail}&w=900`}
                srcSet={`${GOLF_IMAGES.detail}&w=480 480w, ${GOLF_IMAGES.detail}&w=720 720w, ${GOLF_IMAGES.detail}&w=900 900w`}
                sizes="(min-width: 1024px) 36vw, 100vw"
                alt="Putting green and golf score detail"
                width={900}
                height={600}
                loading="lazy"
                decoding="async"
                className="h-full min-h-80 w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,20,38,.72),rgba(29,78,216,.42)),radial-gradient(circle_at_70%_30%,rgba(125,211,252,.2),transparent_32%)]" />
            </div>
            <div className="rounded-[1.65rem] bg-white p-6 text-slate-950">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                What your league gets
              </p>
              <h2 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.04em]">
                The whole season, not just tonight’s score.
              </h2>
              <div className="mt-8 grid gap-3">
                {[
                  ["Current event", "Score entry, scorecards, skins, and points, low-gross, and low-net leaderboards."],
                  ["League page", "Standings, announcements, records, schedule, and top performers."],
                  ["Player page", "Round history, handicap detail, charts, and score breakdowns."],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-black">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
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
            Simple launch pricing
          </p>
          <h2 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            Start with your first golfers. Add more when your league grows.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Each league starts with {BILLING_MIN_GOLFERS} regular golfer spots for {includedTotal}.
            Regular players above the minimum are {formatBillingPrice(BILLING_PRICE_PER_GOLFER)} each; substitutes do not increase the price.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-6">
            <p className="text-sm font-black text-slate-950">Included launch pack</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tight">{includedTotal}</span>
              <span className="mb-2 text-sm font-bold text-slate-500">
                / first {BILLING_MIN_GOLFERS}
              </span>
            </div>
            <div className="mt-8 grid gap-3">
              {[
                "Free admin account setup",
                `${BILLING_MIN_GOLFERS}-golfer league minimum`,
                "League creation workflow",
                "Pay only for extra regular golfers",
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
                <p className="text-xs font-black uppercase tracking-wide">per regular golfer</p>
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
    <div id="register" ref={containerRef} className="min-h-[560px] scroll-mt-6 lg:sticky lg:top-6">
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

  return (
    <footer className="border-t border-white/10 bg-[#071426] px-5 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src={lnLogo} alt="League Night" className="h-12" />
          <p>© {year} League Night LLC. All rights reserved.</p>
        </div>
        <Link to="/login" className="font-bold text-sky-200 transition hover:text-white">
          Sign in
        </Link>
      </div>
    </footer>
  );
}
