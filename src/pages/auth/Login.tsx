import { login, loginWithLeagueCode } from "@api/auth";
import { useToast } from "@/context/useToast";
import { useAppStore } from "@/stores/appStore";
import { normalizeAuthUser } from "@/lib/authUser";
import { ArrowRight, ChevronRight, KeyRound, Lock, Mail } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import lnLogo from "@/assets/league-night-logo.png";

const heroImage =
  "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=76";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { show } = useToast();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leagueCode, setLeagueCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);
  const stateReturnTo = (location.state as { from?: string } | null)?.from;
  const queryReturnTo = new URLSearchParams(location.search).get("redirect");
  const passwordResetComplete = new URLSearchParams(location.search).get("passwordReset") === "success";
  const requestedReturnTo = stateReturnTo || queryReturnTo;
  const returnTo =
    requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/leagues";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const auth: any = await login(email, password);
      const { user } = auth.data;
      const normalizedUser = normalizeAuthUser(user);

      if (!normalizedUser) {
        throw new Error("Login response did not include a user.");
      }

      setUser(normalizedUser);
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Unable to sign in.";
      setError(message);
      show(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeagueCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCodeSubmitting(true);
    setError("");

    try {
      const auth: any = await loginWithLeagueCode(leagueCode);
      const { user, leagueId } = auth.data;
      const normalizedUser = normalizeAuthUser(user);

      if (!normalizedUser || !leagueId) {
        throw new Error("League code login response was incomplete.");
      }

      setUser(normalizedUser);
      navigate(`/league/${leagueId}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Unable to open league.";
      setError(message);
      show(message, "error");
    } finally {
      setIsCodeSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426] text-white">
      <style>{`
        @keyframes login-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-reveal { animation: login-fade-up 700ms cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .login-reveal { animation: none; }
        }
      `}</style>
      <img
        src={`${heroImage}&w=1800`}
        srcSet={`${heroImage}&w=720 720w, ${heroImage}&w=1200 1200w, ${heroImage}&w=1800 1800w`}
        sizes="100vw"
        alt=""
        width={1800}
        height={1200}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-52"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,.24),transparent_26%),linear-gradient(115deg,rgba(7,20,38,.98)_0%,rgba(7,20,38,.78)_48%,rgba(7,20,38,.42)_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 md:px-8">
          <Link to="/" className="group flex items-center gap-3 text-white">
            <img src={lnLogo} alt="League Night" width={74} height={80} className="h-20 w-auto" />
            <div>
              <p className="text-sm font-black tracking-wide">League Night</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                Golf League Management
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/40 px-4 py-2 text-xs font-black text-white/80 transition hover:bg-white/12 hover:text-white"
          >
            Home
            <ChevronRight size={14} />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-8 md:px-8">
          <div className="login-reveal w-full max-w-md rounded-4xl border border-white/12 bg-slate-900/75 p-3 shadow-2xl shadow-black/30">
            <div className="rounded-3xl bg-[#f8fafc] p-6 text-slate-950 shadow-2xl md:p-8">
              <div className="mb-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sky-200">
                  <Lock size={18} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-800">
                  Sign in
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">
                  Welcome back.
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Access leagues, scorecards, player pages, and event operations.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                {passwordResetComplete && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    Password updated. You can sign in now.
                  </div>
                )}
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <label className="grid gap-1.5">
                  <span className="text-xs font-black text-slate-600">Email</span>
                  <div className="auth-field">
                    <Mail size={14} className="text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                </label>

                <Link to="/forgot-password" className="-mt-2 text-right text-xs font-black text-blue-800 underline">
                  Forgot password?
                </Link>

                <label className="grid gap-1.5">
                  <span className="text-xs font-black text-slate-600">Password</span>
                  <div className="auth-field">
                    <Lock size={14} className="text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-sky-300 px-5 text-sm font-black text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  League code
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleLeagueCodeSubmit} className="grid gap-3">
                <label className="grid gap-1.5">
                  <span className="text-xs font-black text-slate-600">View-only access code</span>
                  <div className="auth-field">
                    <KeyRound size={14} className="text-slate-400" />
                    <input
                      type="text"
                      value={leagueCode}
                      onChange={(event) => setLeagueCode(event.target.value.toUpperCase())}
                      className="w-full bg-transparent text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 outline-none placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-400"
                      placeholder="Enter league code"
                      autoComplete="one-time-code"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={isCodeSubmitting || !leagueCode.trim()}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCodeSubmitting ? "Opening league..." : "Open league"}
                  <ArrowRight size={15} />
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                Need an account?{" "}
                <a
                  href={`/${requestedReturnTo ? `?redirect=${encodeURIComponent(returnTo)}` : ""}#register`}
                  className="font-black text-slate-950 underline"
                >
                  Register
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
