import { completePasswordReset } from "@api/auth";
import { getApiErrorMessage } from "@/lib/apiError";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await completePasswordReset(token, password);
      navigate("/login?passwordReset=success", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to reset your password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071426] px-5">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl">
        <div className="rounded-[1.5rem] bg-white p-7 text-slate-950">
          <h1 className="text-3xl font-black tracking-tight">Choose a new password</h1>
          <p className="mb-6 mt-2 text-sm text-slate-600">Use at least eight characters.</p>
          {!token ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">This reset link is missing its token.</p>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <PasswordField label="New password" value={password} onChange={setPassword} />
              <PasswordField label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} />
              {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
              <button disabled={isSubmitting} className="h-12 rounded-full bg-sky-300 text-sm font-black text-slate-950 disabled:opacity-60">
                {isSubmitting ? "Saving..." : "Reset password"}
              </button>
            </form>
          )}
          <Link to="/login" className="mt-5 inline-block text-sm font-black text-slate-700">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        required
        minLength={8}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="new-password"
        className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-700"
      />
    </label>
  );
}
