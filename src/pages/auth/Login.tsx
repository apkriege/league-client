import { login } from "@api/auth";
import { useAppStore } from "@/stores/appStore";
import { ArrowRight, ChevronRight, Flag, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import courseImage from "@/assets/course.png";

const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const auth: any = await login(email, password);
      const { user } = auth.data;

      user.isAdmin = String(user.role).toLowerCase() === "admin";
      setUser(user);
      navigate("/leagues");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <img src={courseImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="absolute inset-0 from-slate-950/55 via-slate-950/70 to-slate-950/80" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-950/30">
              <Flag size={16} />
            </span>
            <div>
              <p className="text-sm font-black tracking-wide">LeagueLoop</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">Club Ready</p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Home
            <ChevronRight size={14} />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-8 md:px-8">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-md md:p-8">
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                Sign in
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">LeagueLoop</h1>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Access events, players, and scorecards.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                  {error}
                </div>
              )}

              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-white/55">
                  Email
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-blue-400/60">
                  <Mail size={14} className="text-white/45" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-white/55">
                  Password
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-blue-400/60">
                  <Lock size={14} className="text-white/45" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              disabled={!googleAuthUrl}
              onClick={() => {
                if (googleAuthUrl) {
                  window.location.href = googleAuthUrl;
                }
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={15} />
              {googleAuthUrl ? "Sign in with Google" : "Google sign-in unavailable"}
            </button>

            <p className="mt-5 text-sm text-white/62">
              Need an account?{" "}
              <a href="/#register" className="font-bold text-white underline decoration-white/30">
                Register
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
