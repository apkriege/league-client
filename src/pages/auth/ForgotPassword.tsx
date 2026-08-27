import { requestPasswordReset } from "@api/auth";
import { getApiErrorMessage } from "@/lib/apiError";
import { ArrowLeft, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.data?.message || "Check your email for a password reset link.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to request a password reset."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Reset your password" description="We’ll email you a secure link that expires in one hour.">
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-600">Email</span>
          <div className="auth-field">
            <Mail size={14} className="text-slate-400" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
            />
          </div>
        </label>
        {message && <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={isSubmitting} className="h-12 rounded-full bg-sky-300 text-sm font-black text-slate-950 disabled:opacity-60">
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link to="/login" className="mt-5 inline-flex items-center gap-1 text-sm font-black text-slate-700">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </AuthCard>
  );
}

function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071426] px-5">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl">
        <div className="rounded-[1.5rem] bg-white p-7 text-slate-950">
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mb-6 mt-2 text-sm leading-6 text-slate-600">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
