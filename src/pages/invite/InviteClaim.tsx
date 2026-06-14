import PageState from "@/components/layout/PageState";
import { useClaimInvitation } from "@api/operations/mutations";
import { useInvitation } from "@api/operations/queries";
import { useAppStore } from "@/stores/appStore";
import { ArrowRight, MailCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

export default function InviteClaim() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { data: invitation, isLoading, isError, error } = useInvitation(token);
  const claim = useClaimInvitation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071426] text-sm text-white/60">
        Loading invitation...
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <PageState
        title="Invitation unavailable"
        message={(error as any)?.message || "This invitation is invalid, expired, or already used."}
        variant="error"
        actionTo="/login"
        actionLabel="Sign in"
      />
    );
  }

  const handleClaim = () => {
    if (!token) return;
    claim.mutate(token, {
      onSuccess: (result: any) => navigate(`/league/${result.leagueId}`),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071426] px-5 text-white">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
        <div className="rounded-[1.5rem] bg-white p-7 text-slate-950">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-blue-800">
            <MailCheck size={20} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">
            League invitation
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Join {invitation.league?.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This invitation is for <strong>{invitation.email}</strong>
            {invitation.player
              ? ` and will connect your account to ${invitation.player.firstName} ${invitation.player.lastName}.`
              : "."}
          </p>

          {claim.isError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {(claim.error as any)?.message || "Could not claim this invitation."}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {user ? (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claim.isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {claim.isPending ? "Claiming..." : "Claim invitation"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
              >
                Sign in to claim
                <ArrowRight size={16} />
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
