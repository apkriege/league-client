import Players from "./forms/PlayersForm";
import TeamsForm from "./forms/TeamsForm";
import ReviewForm from "./forms/ReviewForm";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateLeague } from "@api/league/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { useStripeState } from "@api/payments/queries";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import InfoForm from "./forms/InfoForm";
import { useToast } from "@/context/ToastContext";
import Stepper from "@/components/layout/Stepper";
import { getLeagueBillableGolfers } from "@/lib/billing";
import { useAppStore } from "@/stores/appStore";
import PageState from "@/components/layout/PageState";
import { validateLeagueForm } from "./validation";
import { CREATE_LEAGUE_DRAFT_STORAGE_KEY } from "./leagueDraft";

const getDefaultStartDate = () => new Date();
const getDefaultEndDate = (startDate = getDefaultStartDate()) => {
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  return endDate;
};

const createDefaultLeagueData = () => ({
  name: "",
  description: "",
  numPlayers: 0,
  type: "season",
  format: "individual",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  startDate: getDefaultStartDate(),
  endDate: getDefaultEndDate(),
  players: [],
  teams: [],
});

const modelLeagueData = (league: any) => {
  const { players, teams, access: _legacyAccess, ...info } = league;

  const isSeason = info.type === "season";
  const isTeamSeason = isSeason && info.format === "team";

  return {
    ...info,
    numPlayers: Math.max(1, (players || []).length),
    format: isSeason ? info.format : null,
    players: (players || []).map((p: any) => ({
      ...p,
      id: Number(p.id),
    })),
    teams: isTeamSeason ? teams : [],
  };
};

export default function CreateLeague() {
  const { show } = useToast();
  const topRef = useRef<HTMLDivElement>(null);
  const createLeague = useCreateLeague();
  const createCheckoutSession = useCreateCheckoutSession();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const role = String(user?.role || "").toUpperCase();
  const canCreateLeague = role === "ADMIN" || role === "SUPER";
  const {
    data: stripeState,
    isLoading: billingLoading,
    refetch: refetchStripeState,
  } = useStripeState(Boolean(user));

  const [step, setStep] = useState(1);

  const leagueForm = useForm({
    defaultValues: createDefaultLeagueData(),
  });

  const currentType = String(leagueForm.watch("type") || "").toLowerCase();
  const currentFormat = String(leagueForm.watch("format") || "").toLowerCase();
  const currentSteps =
    currentType === "season" && currentFormat === "team"
      ? ["info", "players", "teams", "review"]
      : ["info", "players", "review"];

  useEffect(() => {
    const freshDefaultLeagueData = createDefaultLeagueData();
    const draft = window.localStorage.getItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
    if (!draft) {
      if (user) {
        leagueForm.reset({
          ...freshDefaultLeagueData,
          contactFirstName: user.firstName || "",
          contactLastName: user.lastName || "",
          contactEmail: user.email || "",
          contactPhone: user.phone || "",
        });
      }
      return;
    }

    try {
      const parsed = JSON.parse(draft);
      const { access: _legacyAccess, ...parsedDraft } = parsed ?? {};
      const resolvedStartDate = parsed?.startDate
        ? new Date(parsed.startDate)
        : freshDefaultLeagueData.startDate;
      const resolvedPlayers =
        Array.isArray(parsed?.players) && parsed.players.length > 0
          ? parsed.players
          : freshDefaultLeagueData.players;
      leagueForm.reset({
        ...freshDefaultLeagueData,
        ...parsedDraft,
        startDate: resolvedStartDate,
        endDate: getDefaultEndDate(resolvedStartDate),
        players: resolvedPlayers,
      });
    } catch {
      window.localStorage.removeItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
    }
  }, [leagueForm, user]);

  useEffect(() => {
    const subscription = leagueForm.watch((values) => {
      window.localStorage.setItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [leagueForm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (!checkoutStatus) return;

    if (checkoutStatus === "registration_success") {
      refetchStripeState();
      show("Golfer slot payment completed successfully.", "success");
      setStep(currentSteps.length);
    } else if (checkoutStatus === "registration_cancel") {
      show("Golfer slot checkout was canceled.", "warning");
      setStep(currentSteps.length);
    } else if (checkoutStatus === "upgrade_success") {
      refetchStripeState();
      show("Additional golfer payment completed successfully.", "success");
      setStep(currentSteps.length);
    } else if (checkoutStatus === "upgrade_cancel") {
      show("Additional golfer checkout was canceled.", "warning");
      setStep(currentSteps.length);
    }

    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, [currentSteps.length, refetchStripeState, show]);

  const handleSubmit = () => {
    if (billingLoading) {
      show("Checking billing status. Please try again in a moment.", "warning");
      return;
    }

    const data = leagueForm.getValues();
    const isTeamSeason =
      String(data.type || "").toLowerCase() === "season" &&
      String(data.format || "").toLowerCase() === "team";
    const validationMessage = validateLeagueForm(data, {
      requirePlayers: true,
      requireTeams: isTeamSeason,
    });
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    const modeledData = modelLeagueData(data);
    const includedGolfers = Number(stripeState?.billing?.includedGolfers || 0);
    const allocatedGolfers = Number(stripeState?.billing?.allocatedGolfers || 0);
    const requestedGolfers = getLeagueBillableGolfers(modeledData.players);
    const targetIncludedGolfers = allocatedGolfers + requestedGolfers;

    if (targetIncludedGolfers > includedGolfers) {
      createCheckoutSession.mutate(
        {
          purpose: includedGolfers === 0 ? "registration" : "seat_upgrade",
          requestedGolfers: targetIncludedGolfers,
          successUrl: `${window.location.origin}/leagues/create?checkout=upgrade_success`,
          cancelUrl: `${window.location.origin}/leagues/create?checkout=upgrade_cancel`,
        },
        {
          onSuccess: (checkout) => {
            if ((checkout as any)?.alreadyCovered) {
              refetchStripeState();
              show("Golfer slots are already covered. Creating league...", "success");
              createLeague.mutate(modeledData, {
                onSuccess: (league) => {
                  window.localStorage.removeItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
                  navigate(`/league/${league.id}/admin`);
                },
                onError: (error) => {
                  show((error as any)?.message || "Failed to create league.", "error");
                },
              });
              return;
            }

            if (!checkout?.url) {
              show("Could not start golfer upgrade checkout. Please try again.", "error");
              return;
            }
            window.location.href = checkout.url;
          },
          onError: (error: any) => {
            show(error?.message || "Failed to start golfer upgrade checkout.", "error");
          },
        }
      );
      return;
    }

    createLeague.mutate(modeledData, {
      onSuccess: (league) => {
        window.localStorage.removeItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
        navigate(`/league/${league.id}/admin`);
      },
      onError: (error) => {
        show((error as any)?.message || "Failed to create league.", "error");
      },
    });
  };

  const leagueData = leagueForm.watch();
  const steps =
    leagueData.type === "season" && leagueData.format === "team"
      ? ["info", "players", "teams", "review"]
      : ["info", "players", "review"];
  const footerIncludedGolfers = Number(stripeState?.billing?.includedGolfers || 0);
  const footerAllocatedGolfers = Number(stripeState?.billing?.allocatedGolfers || 0);
  const footerRequestedGolfers = getLeagueBillableGolfers(leagueData.players || []);
  const footerAdditionalGolfersRequired = Math.max(
    0,
    footerAllocatedGolfers + footerRequestedGolfers - footerIncludedGolfers
  );
  const finalActionLabel = footerAdditionalGolfersRequired > 0
      ? `Pay for ${footerAdditionalGolfersRequired} More Golfers`
      : "Create League";

  const goToStep = (nextStep: number) => {
    setStep(Math.max(1, Math.min(steps.length, nextStep)));
  };

  useEffect(() => {
    setStep((prev) => Math.max(1, Math.min(steps.length, prev)));
  }, [steps.length]);

  if (user && !canCreateLeague) {
    return (
      <PageState
        title="Access Denied"
        message="Only league admins can create new leagues."
        variant="forbidden"
        actionTo="/leagues"
        actionLabel="Back to Leagues"
      />
    );
  }

  return (
    <div>
      <div ref={topRef} />
      <div>
        <FormProvider {...leagueForm}>
          <div className="step-body">
            {step === 1 && <InfoForm />}
            {step === 2 && <Players />}
            {steps.length === 4 && step === 3 && <TeamsForm />}
            {((steps.length === 4 && step === 4) || (steps.length === 3 && step === 3)) && (
              <ReviewForm
                leagueData={leagueData}
                billing={stripeState?.billing}
                isBillingLoading={billingLoading}
              />
            )}
          </div>
        </FormProvider>
      </div>
      {step <= steps.length && (
        <Stepper
          step={step}
          totalSteps={steps.length}
          isSubmitting={createLeague.isPending || createCheckoutSession.isPending || billingLoading}
          smoothScroll
          scrollTargetRef={topRef}
          nextLabel={
            step === steps.length
              ? billingLoading
                ? "Checking Billing..."
                : finalActionLabel
              : undefined
          }
          onBack={() => {
            goToStep(Math.max(1, step - 1));
          }}
          onNext={() => {
            if (step === steps.length) {
              handleSubmit();
              return;
            }

            goToStep(step + 1);
          }}
        />
      )}
    </div>
  );
}
