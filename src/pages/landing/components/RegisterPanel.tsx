import { register } from "@api/auth";
import { useToast } from "@/context/useToast";
import { useAppStore } from "@/stores/appStore";
import { normalizeAuthUser } from "@/lib/authUser";
import { getApiErrorMessage } from "@/lib/apiError";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearCreateLeagueDraft } from "@/pages/league/leagueDraft";

type RegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const emptyRegistrationForm: RegistrationForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function RegisterPanel() {
  const { show } = useToast();
  const { setUser } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedReturnTo = new URLSearchParams(location.search).get("redirect");
  const invitationToken = requestedReturnTo?.match(/^\/invite\/([^/?#]+)/)?.[1];
  const isInvitationRegistration = Boolean(invitationToken);
  const [form, setForm] = useState(emptyRegistrationForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = (key: keyof RegistrationForm, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await register({ ...form, invitationToken });
      const normalizedUser = normalizeAuthUser(response.data?.user);
      if (normalizedUser) setUser(normalizedUser);

      setStatus("success");
      setMessage(
        isInvitationRegistration
          ? "Account created. Finish accepting your league invitation."
          : "Account created. Start building your first league.",
      );
      clearCreateLeagueDraft();
      const returnTo =
        requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
          ? requestedReturnTo
          : "/leagues/create";
      navigate(returnTo);
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, "Unable to create account.");
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
          minLength={8}
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
        />

        {message && (
          <p
            className={`rounded-2xl px-4 py-3 text-xs font-bold ${
              status === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
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
    <label className="grid gap-1.5">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        required
        type={type}
        minLength={minLength}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-800/10"
      />
    </label>
  );
}
