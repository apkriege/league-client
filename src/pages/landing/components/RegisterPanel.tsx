import { register, resendEmailVerification } from "@api/auth";
import { useToast } from "@/context/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";

type RegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedPolicies: boolean;
};

const emptyRegistrationForm: RegistrationForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedPolicies: false,
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function RegisterPanel() {
  const { show } = useToast();
  const location = useLocation();
  const requestedReturnTo = new URLSearchParams(location.search).get("redirect");
  const invitationToken = requestedReturnTo?.match(/^\/invite\/([^/?#]+)/)?.[1];
  const isInvitationRegistration = Boolean(invitationToken);
  const [form, setForm] = useState(emptyRegistrationForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "resending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const update = (
    key: Exclude<keyof RegistrationForm, "acceptedPolicies">,
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const passwordsMatch = form.password === form.confirmPassword;
  const formIsComplete =
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    isValidEmail(form.email) &&
    form.password.length >= 8 &&
    Boolean(form.confirmPassword) &&
    passwordsMatch &&
    form.acceptedPolicies;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      if (!passwordsMatch) {
        setStatus("error");
        setMessage("Passwords must match.");
        return;
      }
      const response = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        acceptedPolicies: form.acceptedPolicies,
        invitationToken,
      });
      setStatus("success");
      setRegisteredEmail(form.email.trim().toLowerCase());
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setMessage(
        response.data?.message || "Account created. Check your email to verify your account.",
      );
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, "Unable to create account.");
      setStatus("error");
      setMessage(errorMessage);
      show(errorMessage, "error");
    }
  };

  const resend = async () => {
    if (!registeredEmail) return;
    setStatus("resending");
    try {
      const response = await resendEmailVerification(registeredEmail);
      setMessage(response.data?.message || "A new verification email has been sent.");
      setStatus("success");
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, "Unable to resend verification email.");
      setStatus("error");
      setMessage(errorMessage);
      show(errorMessage, "error");
    }
  };

  return (
    <aside
      className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10"
    >
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">
              {isInvitationRegistration ? "Player invitation" : "Register"}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {isInvitationRegistration ? "Create your player account." : "Start League Night Pro."}
            </h2>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-300 text-slate-950">
            <LockKeyhole size={18} />
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/62">
          {isInvitationRegistration
            ? "Use the email address that received the invitation, then return to the league to finish joining."
            : "Create your admin account free. Each league is billed separately based on its regular-player roster."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          minLength={8}
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
        />
        <TextField
          label="Confirm password"
          type="password"
          minLength={8}
          value={form.confirmPassword}
          onChange={(value) => update("confirmPassword", value)}
          autoComplete="new-password"
        />
        {form.confirmPassword && !passwordsMatch && (
          <p className="px-2 text-xs font-bold text-red-600">Passwords must match.</p>
        )}

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
          <input
            required
            type="checkbox"
            checked={form.acceptedPolicies}
            onChange={(event) =>
              setForm((current) => ({ ...current, acceptedPolicies: event.target.checked }))
            }
            className="mt-0.5 h-4 w-4 shrink-0 accent-sky-500"
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="font-bold text-slate-700 underline hover:text-slate-950">
              Terms of Service
            </Link>{" "}
            and acknowledge the{" "}
            <Link to="/privacy" className="font-bold text-slate-700 underline hover:text-slate-950">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {message && (
          <p
            className={`rounded-2xl px-4 py-3 text-xs font-bold ${
              status === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </p>
        )}

        {registeredEmail && (
          <button
            type="button"
            disabled={status === "resending"}
            onClick={() => void resend()}
            className="text-xs font-black text-slate-700 underline disabled:opacity-60"
          >
            {status === "resending" ? "Sending…" : "Resend verification email"}
          </button>
        )}

        <button
          type="submit"
          disabled={!formIsComplete || status === "submitting" || Boolean(registeredEmail)}
          className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-sky-300 px-5 text-sm font-black text-slate-950 transition hover:bg-sky-200 disabled:opacity-60"
        >
          {status === "submitting"
            ? "Creating account..."
            : isInvitationRegistration
              ? "Create player account"
              : "Create admin account"}
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
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        required
        type={type}
        minLength={minLength}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-800/10"
      />
    </label>
  );
}
