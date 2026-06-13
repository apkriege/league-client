import { register } from "@api/auth";
import { createCheckoutSession } from "@api/payments";
import { useAppStore } from "@/stores/appStore";
import { BILLING_MIN_GOLFERS, BILLING_PRICE_PER_GOLFER, formatBillingPrice } from "@/lib/billing";
import { normalizeAuthUser } from "@/lib/authUser";
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
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router";

const GOLF_IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1800&q=85",
  aerial:
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=85",
  green:
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=700&q=80",
};

const stats = [
  { value: "18", label: "hole scorecards" },
  { value: "4", label: "scoring formats" },
  { value: "Live", label: "standings & skins" },
];

const workflow = [
  {
    title: "Build the league",
    body: "Create players, teams, flights, events, courses, and tees from one admin workspace.",
    icon: <Flag size={18} />,
  },
  {
    title: "Run the night",
    body: "Print scorecards, enter scores by flight, swap players, and lock completed events.",
    icon: <ClipboardList size={18} />,
  },
  {
    title: "Publish results",
    body: "Show standings, skins, player trends, scorecards, and round history immediately.",
    icon: <Trophy size={18} />,
  },
];

const features = [
  {
    title: "League operations",
    body: "Season setup, recurring schedules, team formats, individual formats, flights, and admin controls.",
    icon: <CalendarDays size={18} />,
  },
  {
    title: "Scoring engine",
    body: "Gross, net, match play, stableford-style points, skins, scorecards, and handicap movement.",
    icon: <Gauge size={18} />,
  },
  {
    title: "Player intelligence",
    body: "Every player gets history, trends, differentials, handicap detail, and round-by-round context.",
    icon: <LineChart size={18} />,
  },
  {
    title: "Club-ready course data",
    body: "Manage clubs, courses, tees, hole pars, distances, handicaps, ratings, and slopes.",
    icon: <Flag size={18} />,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f1e8] text-[#101713]">
      <style>{`
        @keyframes landing-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes landing-drift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(18px, -18px, 0) rotate(1deg); }
        }
        @keyframes landing-scan {
          0% { transform: translateX(-100%); opacity: 0; }
          20%, 80% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .landing-reveal { animation: landing-fade-up 780ms cubic-bezier(.2,.8,.2,1) both; }
        .landing-delay-1 { animation-delay: 120ms; }
        .landing-delay-2 { animation-delay: 240ms; }
        .landing-delay-3 { animation-delay: 360ms; }
        .landing-drift { animation: landing-drift 9s ease-in-out infinite; }
        .landing-scan::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          animation: landing-scan 4.8s ease-in-out infinite;
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
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07140d] text-white">
      <img
        src={GOLF_IMAGES.hero}
        alt="Golfer finishing a drive on a green fairway"
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-58"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(179,255,104,.28),transparent_26%),linear-gradient(115deg,rgba(7,20,13,.98)_0%,rgba(7,20,13,.78)_48%,rgba(7,20,13,.34)_100%)]" />
      <div className="absolute -left-24 top-32 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl landing-drift" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-emerald-400/12 blur-3xl landing-drift" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-300 text-slate-950 shadow-lg shadow-lime-950/20 transition-transform group-hover:-rotate-6">
            <Flag size={18} />
          </span>
          <div>
            <p className="text-sm font-black tracking-wide">Golf League App</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              League Management
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 rounded-full border border-white/10 bg-white/8 px-5 py-2 text-xs font-bold text-white/70 backdrop-blur-md md:flex">
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
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            Sign in
          </Link>
          <a
            href="#register"
            className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-lime-950/20 transition hover:bg-lime-200"
          >
            Start
          </a>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:pb-28 lg:pt-20">
        <div>
          <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-lime-100 backdrop-blur-md">
            <Sparkles size={13} />
            Premium league management for golf clubs
          </div>

          <h1 className="landing-reveal landing-delay-1 mt-6 max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.065em] text-white md:text-8xl">
            Run league night like a professional operation.
          </h1>

          <p className="landing-reveal landing-delay-2 mt-7 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            Golf League App gives captains and clubs a complete golf league operating system:
            scheduling, scorecards, teams, flights, skins, standings, handicap tracking, and
            player history.
          </p>

          <div className="landing-reveal landing-delay-3 mt-8 flex flex-wrap gap-3">
            <a
              href="#register"
              className="group inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-lime-950/25 transition hover:bg-lime-200"
            >
              Launch your league
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/12"
            >
              See the system
              <ChevronRight size={16} />
            </a>
          </div>

          <div className="landing-reveal landing-delay-3 mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-md"
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
      <div className="absolute -inset-5 rounded-[2.5rem] bg-lime-300/18 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl landing-scan">
        <div className="rounded-[1.5rem] bg-[#fbfaf5] text-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Live event
              </p>
              <h2 className="text-base font-black">Thursday Match Play</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-800">
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
                  <BarChart3 size={15} className="text-lime-300" />
                  <p className="text-sm font-black">Standings movement</p>
                </div>
                <p className="text-[10px] font-bold text-white/42">LIVE</p>
              </div>
              <div className="flex h-32 items-end gap-3">
                {[42, 58, 35, 74, 64, 88, 53, 78].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-xl ${
                        index === 5 ? "bg-lime-300" : "bg-white/18"
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
                ["Scorecards printed", "18-hole team scorecards"],
                ["Handicaps locked", "pre-round values preserved"],
                ["Skins calculated", "ties excluded automatically"],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-100 text-emerald-800">
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
    <section className="relative border-b border-black/5 bg-[#f5f1e8]">
      <div className="mx-auto grid max-w-7xl gap-3 px-5 py-6 md:grid-cols-4 md:px-8">
        {[
          "Course and tee database",
          "Team and individual seasons",
          "Match play and stroke scoring",
          "Admin-safe event sequencing",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3">
            <CircleCheck size={15} className="text-emerald-700" />
            <span className="text-xs font-black text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="product" className="relative overflow-hidden bg-[#f5f1e8] px-5 py-24 md:px-8">
      <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="landing-reveal">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">
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
                className="group rounded-3xl border border-black/5 bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lime-200 transition group-hover:rotate-3">
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
          <div className="absolute -inset-6 rounded-[3rem] bg-emerald-900/10 blur-2xl" />
          <div className="relative grid gap-4 lg:grid-cols-[1fr_0.74fr]">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-3 shadow-2xl shadow-emerald-950/18">
              <img
                src={GOLF_IMAGES.aerial}
                alt="Golf fairway and player in motion"
                className="h-72 w-full rounded-[1.45rem] object-cover opacity-90"
              />
              <div className="p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">
                  Event command center
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">
                  Every flight, card, score, and matchup in one flow.
                </h3>
              </div>
            </div>

            <div className="grid gap-4">
              <MetricCard label="Avg setup time" value="4 min" icon={<Zap size={16} />} />
              <MetricCard label="Score views" value="5" icon={<BarChart3 size={16} />} />
              <MetricCard label="Data model" value="Club-ready" icon={<ShieldCheck size={16} />} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-xl shadow-emerald-950/8">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-100 text-emerald-800">
        {icon}
      </div>
      <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="bg-[#101713] px-5 py-24 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
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
            ["01", "Configure", "Courses, tees, teams, players, event rules, and point tables."],
            ["02", "Print", "Two-per-page scorecards with player handicaps and event details."],
            ["03", "Score", "Enter by flight, preserve order, calculate points, net, and skins."],
            ["04", "Review", "Publish event scorecards, standings, player pages, and trends."],
          ].map(([step, title, body]) => (
            <div
              key={step}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]"
            >
              <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-lime-300/10 blur-2xl transition group-hover:bg-lime-300/20" />
              <p className="text-[10px] font-black text-lime-300">{step}</p>
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
    <section className="relative overflow-hidden bg-white px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">
            Product depth
          </p>
          <h2 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            Serious functionality without a heavy admin experience.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Golf League App is designed to feel premium, but the real value is operational depth:
            correct sequencing, clean route protection, accurate score breakdowns, and league data
            that updates when scores are finalized.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="rounded-[1.75rem] border border-slate-200 bg-[#fbfaf5] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/8"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="mb-12 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lime-200">
                {feature.icon}
              </div>
              <h3 className="text-lg font-black text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConversionSection() {
  return (
    <section className="relative overflow-hidden bg-[#f5f1e8] px-5 py-24 md:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-black/5" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="overflow-hidden rounded-[2.25rem] bg-slate-950 p-3 shadow-2xl shadow-emerald-950/15">
          <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
            <img
              src={GOLF_IMAGES.green}
              alt="Golf course fairway used as product atmosphere"
              className="h-full min-h-80 rounded-[1.65rem] object-cover opacity-90"
            />
            <div className="rounded-[1.65rem] bg-white p-6 text-slate-950">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                What admins see
              </p>
              <h2 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.04em]">
                The whole season, not just tonight’s score.
              </h2>
              <div className="mt-8 grid gap-3">
                {[
                  ["Current event", "Score entry, scorecards, skins, and leaderboards."],
                  ["League page", "Standings, trends, records, schedule, and top performers."],
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

        <RegisterPanel />
      </div>
    </section>
  );
}

function PricingSection() {
  const includedTotal = formatBillingPrice(BILLING_PRICE_PER_GOLFER * BILLING_MIN_GOLFERS);

  return (
    <section id="pricing" className="bg-white px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">
            Simple launch pricing
          </p>
          <h2 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
            Start with your first golfers. Add more when your league grows.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Registration starts with {BILLING_MIN_GOLFERS} golfer slots for {includedTotal}. If you
            add more golfers during league creation, the app charges only the difference.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-[#fbfaf5] p-6">
            <p className="text-sm font-black text-slate-950">Included launch pack</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tight">{includedTotal}</span>
              <span className="mb-2 text-sm font-bold text-slate-500">
                / first {BILLING_MIN_GOLFERS}
              </span>
            </div>
            <div className="mt-8 grid gap-3">
              {[
                "Admin account setup",
                `${BILLING_MIN_GOLFERS} included golfer slots`,
                "League creation workflow",
                "Upgrade only for extra golfers",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <Check size={15} className="text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <div className="flex flex-col justify-between gap-8 md:flex-row">
              <div>
                <p className="text-sm font-black">Per additional golfer</p>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/58">
                  Keep pricing flexible while you decide the final model. The rate is centralized
                  so it can be changed later without redesigning the flow.
                </p>
              </div>
              <div className="shrink-0 rounded-3xl bg-lime-300 px-6 py-5 text-slate-950">
                <p className="text-5xl font-black tracking-tight">
                  {formatBillingPrice(BILLING_PRICE_PER_GOLFER)}
                </p>
                <p className="text-xs font-black uppercase tracking-wide">per golfer</p>
              </div>
            </div>

            <a
              href="#register"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-lime-100"
            >
              Create account and checkout
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegisterPanel() {
  const { setUser } = useAppStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (checkoutStatus !== "registration_cancel") return;

    setStatus("error");
    setMessage("Registration checkout was canceled.");
    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await register(form);
      const user = response.data?.user;
      const normalizedUser = normalizeAuthUser(user);
      if (normalizedUser) {
        setUser(normalizedUser);
      }
      setStatus("success");
      setMessage("Account created. Redirecting to secure checkout...");

      const checkout = await createCheckoutSession({
        purpose: "registration",
        requestedGolfers: BILLING_MIN_GOLFERS,
        successUrl: `${window.location.origin}/leagues?checkout=registration_success`,
        cancelUrl: `${window.location.origin}/?checkout=registration_cancel#register`,
      });

      if (!checkout?.url) {
        throw new Error("Could not start registration checkout.");
      }

      window.location.href = checkout.url;
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.response?.data?.message || "Unable to create account.");
    }
  };

  return (
    <aside
      id="register"
      className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 lg:sticky lg:top-6"
    >
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">
              Register
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Start Golf League App.</h2>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
            <LockKeyhole size={18} />
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/62">
          Includes your admin account and {BILLING_MIN_GOLFERS} golfer slots starting at{" "}
          {formatBillingPrice(BILLING_PRICE_PER_GOLFER * BILLING_MIN_GOLFERS)}.
        </p>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First name"
            value={form.firstName}
            onChange={(value) => update("firstName", value)}
            autoComplete="given-name"
          />
          <TextField
            label="Last name"
            value={form.lastName}
            onChange={(value) => update("lastName", value)}
            autoComplete="family-name"
          />
        </div>

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => update("email", value)}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          minLength={6}
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
        />

        {message && (
          <p
            className={`rounded-2xl px-4 py-3 text-xs font-bold ${
              status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lime-300 px-5 text-sm font-black text-slate-950 transition hover:bg-lime-200 disabled:opacity-60"
        >
          {status === "submitting" ? "Creating account..." : "Create account"}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-black text-slate-950 underline">
          Sign in
        </Link>
      </p>
    </aside>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  minLength,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        required
        type={type}
        minLength={minLength}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-800/10"
      />
    </label>
  );
}
