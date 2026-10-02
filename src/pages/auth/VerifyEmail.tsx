import { verifyEmail } from "@api/auth";
import { getApiErrorMessage } from "@/lib/apiError";
import { normalizeAuthUser } from "@/lib/authUser";
import { useAppStore } from "@/stores/appStore";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

type VerificationState =
  | { status: "verifying" }
  | { status: "verified"; redirectTo: string }
  | { status: "error"; message: string };

const REDIRECT_DELAY_SECONDS = 3;

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);
  const requestStarted = useRef(false);
  const token = params.get("token") || "";
  const [state, setState] = useState<VerificationState>(() =>
    token
      ? { status: "verifying" }
      : { status: "error", message: "This verification link is missing its token." },
  );
  const [secondsRemaining, setSecondsRemaining] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;

    if (!token) return;

    void verifyEmail(token)
      .then((response) => {
        const user = normalizeAuthUser(response.data?.user);
        if (!user) throw new Error("Verification response did not include a user.");
        setUser(user);
        const redirectTo = String(response.data?.redirectTo || "/leagues/create");
        setState({
          status: "verified",
          redirectTo:
            redirectTo.startsWith("/") && !redirectTo.startsWith("//")
              ? redirectTo
              : "/leagues/create",
        });
      })
      .catch((error: unknown) => {
        setState({
          status: "error",
          message: getApiErrorMessage(error, "Unable to verify this email address."),
        });
      });
  }, [setUser, token]);

  useEffect(() => {
    if (state.status !== "verified") return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    const redirect = window.setTimeout(() => {
      navigate(state.redirectTo, { replace: true });
    }, REDIRECT_DELAY_SECONDS * 1000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(redirect);
    };
  }, [navigate, state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071426] px-5">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl">
        <div className="rounded-[1.5rem] bg-white p-8 text-center text-slate-950">
          {state.status === "verifying" && (
            <>
              <LoaderCircle className="mx-auto animate-spin text-sky-600" size={42} />
              <h1 className="mt-5 text-3xl font-black tracking-tight">Verifying your email</h1>
              <p className="mt-2 text-sm text-slate-600">This should only take a moment.</p>
            </>
          )}

          {state.status === "verified" && (
            <>
              <CheckCircle2 className="mx-auto text-emerald-600" size={46} />
              <h1 className="mt-5 text-3xl font-black tracking-tight">Email has been verified</h1>
              <p className="mt-2 text-sm text-slate-600">
                Redirecting you in {secondsRemaining}…
              </p>
              <button
                type="button"
                onClick={() => navigate(state.redirectTo, { replace: true })}
                className="mt-6 h-11 rounded-full bg-sky-300 px-6 text-sm font-black text-slate-950"
              >
                Continue now
              </button>
            </>
          )}

          {state.status === "error" && (
            <>
              <XCircle className="mx-auto text-red-600" size={46} />
              <h1 className="mt-5 text-3xl font-black tracking-tight">Verification failed</h1>
              <p className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {state.message}
              </p>
              <Link to="/login" className="mt-6 inline-block text-sm font-black text-slate-700">
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
