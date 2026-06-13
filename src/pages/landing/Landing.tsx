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
  Flag,
  ListChecks,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router";
import courseImage from "@/assets/course.png";

type Concept = {
  eyebrow: string;
  headline: string;
  subhead: string;
  image: string;
  tone: string;
  primary: string;
  features: Array<{ title: string; body: string; icon: ReactNode }>;
  proof: string[];
  workflow: string[];
};

const active: Concept = {
  eyebrow: "Club Ready",
  headline: "Professional league software for clubs, captains, and recurring events.",
  subhead:
    "A polished system for courses and organizers who need reliable setup, clean records, and a better experience for every league.",
  image: courseImage,
  tone: "Premium league operations for modern golf programs",
  primary: "Launch your league",
  features: [
    {
      title: "Course management",
      body: "Manage courses, tees, hole data, distances, pars, handicaps, and event-ready score layouts.",
      icon: <Flag size={16} />,
    },
    {
      title: "Season structure",
      body: "Support individual or team seasons, recurring schedules, flexible scoring, and organized event records.",
      icon: <CalendarDays size={16} />,
    },
    {
      title: "Clean operations",
      body: "Give admins a quiet, professional workspace built for repeated use and fast decisions.",
      icon: <ShieldCheck size={16} />,
    },
  ],
  proof: ["Course database", "Team leagues", "Season standings", "Admin controls"],
  workflow: ["Add courses", "Configure league", "Run events", "Keep records"],
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative min-h-[86vh] overflow-hidden">
        <img src={active.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/68" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-950">
              <Flag size={16} />
            </span>
            <span className="text-sm font-black tracking-wide">LeagueLoop</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md border border-white/25 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
            >
              Sign in
            </Link>
            <a
              href="#register"
              className="rounded-md bg-white px-3 py-2 text-xs font-black text-slate-950 hover:bg-lime-100"
            >
              Register
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-16 lg:grid-cols-[minmax(0,1fr)_430px] lg:pt-20">
          <div className="max-w-3xl text-white">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {active.eyebrow} / {active.tone}
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] md:text-7xl">
              {active.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
              {active.subhead}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#register"
                className="inline-flex items-center gap-2 rounded-md bg-lime-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-lime-200"
              >
                {active.primary}
                <ArrowRight size={16} />
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Sign in
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="self-end rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-wide text-white/65">
              Built for organized league operations
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["18", "hole scorecards"],
                ["Team", "and individual play"],
                ["Live", "season records"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-white/15 bg-white/10 p-3">
                  <p className="text-lg font-black text-white">{value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {active.proof.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <Check size={14} className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-4">
            {active.workflow.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-bold text-slate-800">{step}</span>
              </div>
            ))}
          </div>
        </section>

        <ProductShowcase />

        <section id="workflow" className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Built around the league lifecycle
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                A clean workflow from course setup to final standings.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-4">
              {[
                {
                  title: "Set the course",
                  body: "Store tees, pars, distances, handicaps, and hole layouts once.",
                  icon: <Flag size={18} />,
                },
                {
                  title: "Build the event",
                  body: "Choose format, scoring, holes, start side, teams, and flights.",
                  icon: <CalendarDays size={18} />,
                },
                {
                  title: "Score the round",
                  body: "Capture gross, net, skins, points, match results, and putts.",
                  icon: <ListChecks size={18} />,
                },
                {
                  title: "Review the season",
                  body: "Track standings, player history, score trends, and records.",
                  icon: <Trophy size={18} />,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg bg-white p-5 shadow-sm">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-black text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Feature Set
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  Everything needed to run the season.
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {active.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-800">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>

          <RegisterPanel />
        </section>

        <PricingSection />
      </main>
    </div>
  );
}

function ProductShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Product preview
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            The app feels organized because the work is organized.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            LeagueLoop keeps the admin surface quiet and dense: schedules are scannable, player
            pages show useful history, and event pages surface the details that matter on league
            night.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              ["Events", "Flights, tee times, scoring settings, scorecards, and event metrics."],
              ["Players", "Handicaps, averages, score distribution, and full round history."],
              ["Leagues", "Standings, records, season trends, team results, and schedules."],
            ].map(([label, body]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-black text-slate-950">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 shadow-xl">
          <div className="rounded-lg bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  League dashboard
                </p>
                <p className="text-sm font-black text-slate-950">Thursday Night League</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
                Active season
              </span>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {[
                ["12", "Events"],
                ["48", "Players"],
                ["624", "Scores"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 px-4 pb-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-md border border-slate-200 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 size={15} className="text-slate-400" />
                  <p className="text-sm font-black text-slate-950">Score distribution</p>
                </div>
                <div className="flex h-32 items-end gap-3">
                  {[18, 34, 76, 58, 31, 12].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col justify-end gap-2">
                      <div
                        className="rounded-t bg-slate-900"
                        style={{ height: `${height}%` }}
                      />
                      <div className="h-1 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-black text-slate-950">Next event</p>
                <div className="mt-4 space-y-3">
                  {["Back nine", "Team match", "8:30 AM start", "18 scorecards"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={14} className="text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-wide text-lime-300">Pricing</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            Pick the plan that matches your league size.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/65">
            Start simple, then grow into multi-league operations when the program expands.
          </p>
          <div className="mx-auto mt-8 inline-flex rounded-md border border-white/15 bg-white/10 p-1">
            <span className="rounded px-4 py-2 text-xs font-black text-white">Monthly</span>
            <span className="rounded bg-lime-300 px-4 py-2 text-xs font-black text-slate-950">
              Annual / 2 months free
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "$19",
              body: "For one captain running a small recurring group.",
              features: ["1 league", "Up to 32 players", "Events and scorecards", "Player stats"],
            },
            {
              name: "Club",
              price: "$49",
              body: "For active leagues that need teams, seasons, and deeper reporting.",
              featured: true,
              features: [
                "Unlimited events",
                "Up to 150 players",
                "Team and individual seasons",
                "League metrics and standings",
              ],
            },
            {
              name: "Program",
              price: "$129",
              body: "For clubs and organizers managing multiple leagues or programs.",
              features: [
                "Multiple leagues",
                "Course and tee management",
                "Advanced admin controls",
                "Priority setup support",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.featured
                  ? "border-lime-300 bg-white text-slate-950"
                  : "border-white/15 bg-white/5"
              }`}
            >
              {plan.featured && (
                <p className="mb-4 inline-flex rounded-full bg-lime-300 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-950">
                  Most popular
                </p>
              )}
              <h3 className="text-xl font-black">{plan.name}</h3>
              <p
                className={`mt-2 text-sm leading-6 ${
                  plan.featured ? "text-slate-600" : "text-white/60"
                }`}
              >
                {plan.body}
              </p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className={plan.featured ? "mb-2 text-slate-500" : "mb-2 text-white/45"}>
                  /mo
                </span>
              </div>
              <a
                href="#register"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-black ${
                  plan.featured
                    ? "bg-slate-950 text-white"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                Get started
              </a>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check
                      size={15}
                      className={plan.featured ? "text-emerald-600" : "text-lime-300"}
                    />
                    <span className={plan.featured ? "text-slate-700" : "text-white/75"}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5"
    >
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">Register</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Start your league account.</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Registration includes your admin account and {BILLING_MIN_GOLFERS} golfer slots starting at{" "}
        {formatBillingPrice(BILLING_PRICE_PER_GOLFER * BILLING_MIN_GOLFERS)}.
      </p>

      <form onSubmit={submit} className="mt-5 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-slate-600">First name</span>
            <input
              required
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-950"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-slate-600">Last name</span>
            <input
              required
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-950"
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-slate-600">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-950"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-slate-600">Password</span>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-950"
          />
        </label>

        {message && (
          <p
            className={`rounded-md px-3 py-2 text-xs font-semibold ${
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
          className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white disabled:opacity-60"
        >
          {status === "submitting" ? "Creating account..." : "Create account"}
          <ArrowRight size={15} />
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-slate-950 underline">
          Sign in
        </Link>
      </p>
    </aside>
  );
}
