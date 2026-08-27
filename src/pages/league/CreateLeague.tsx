import Players from "./forms/PlayersForm";
import TeamsForm from "./forms/TeamsForm";
import ReviewForm from "./forms/ReviewForm";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useCreateLeague } from "@api/league/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { useStripeState } from "@api/payments/queries";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import InfoForm from "./forms/InfoForm";
import { useToast } from "@/context/useToast";
import Stepper from "@/components/layout/Stepper";
import { getLeagueBillableGolfers } from "@/lib/billing";
import { useAppStore } from "@/stores/appStore";
import PageState from "@/components/layout/PageState";
import {
  validateLeagueForm,
  validateLeagueWizardStep,
  type LeagueWizardStep,
} from "./validation";
import { CREATE_LEAGUE_DRAFT_STORAGE_KEY } from "./leagueDraft";
import { confirmCheckoutSession } from "@api/payments";
import PaymentReturnNotice from "@/features/payments/components/PaymentReturnNotice";
import {
  clearCheckoutReturnFromUrl,
  getCheckoutReturn,
} from "@/features/payments/checkoutReturn";
import {
  PaymentPipelineError,
  toPaymentPipelineError,
} from "@/features/payments/PaymentPipelineError";

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
  holeFormat: "18",
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

const prepareLeagueData = (data: any) => {
  const isTeamSeason =
    String(data.type || "").toLowerCase() === "season" &&
    String(data.format || "").toLowerCase() === "team";
  const validationMessage = validateLeagueForm(data, {
    requirePlayers: true,
    requireTeams: isTeamSeason,
  });

  return {
    validationMessage,
    modeledData: validationMessage ? null : modelLeagueData(data),
  };
};

export default function CreateLeague() {
  const { show } = useToast();
  const topRef = useRef<HTMLDivElement>(null);
  const checkoutResumeStartedRef = useRef(false);
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
  const [checkoutStatus, setCheckoutStatus] = useState(
    () => getCheckoutReturn(window.location.search).checkout,
  );
  const [checkoutReturnMessage, setCheckoutReturnMessage] = useState<string | null>(null);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [confirmationAttempt, setConfirmationAttempt] = useState(0);
  const [paymentPipelineError, setPaymentPipelineError] = useState<PaymentPipelineError | null>(
    null
  );

  const leagueForm = useForm({
    defaultValues: createDefaultLeagueData(),
  });

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
      const resolvedEndDate = parsed?.endDate
        ? new Date(parsed.endDate)
        : getDefaultEndDate(resolvedStartDate);
      const resolvedPlayers =
        Array.isArray(parsed?.players) && parsed.players.length > 0
          ? parsed.players
          : freshDefaultLeagueData.players;
      leagueForm.reset({
        ...freshDefaultLeagueData,
        ...parsedDraft,
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
        players: resolvedPlayers,
      });
    } catch {
      window.localStorage.removeItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
    }
  }, [leagueForm, user]);

  useEffect(() => {
    const unsubscribe = leagueForm.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        window.localStorage.setItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY, JSON.stringify(values));
      },
    });

    return unsubscribe;
  }, [leagueForm]);

  const createLeagueAndOpenAdmin = useCallback(
    async (modeledData: any) => {
      const league = await createLeague.mutateAsync(modeledData);
      window.localStorage.removeItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
      navigate(`/league/${league.id}/admin`);
    },
    [createLeague, navigate],
  );

  useEffect(() => {
    if (!checkoutStatus) return;

    if (checkoutStatus === "registration_cancel" || checkoutStatus === "upgrade_cancel") {
      clearCheckoutReturnFromUrl();
      show("Golfer checkout was canceled.", "warning");
      return;
    }

    if (
      !["registration_success", "upgrade_success"].includes(checkoutStatus) ||
      checkoutResumeStartedRef.current
    ) {
      return;
    }

    checkoutResumeStartedRef.current = true;

    const resumeLeagueCreation = async () => {
      const { sessionId } = getCheckoutReturn(window.location.search);
      if (!sessionId) {
        setPaymentPipelineError(
          new PaymentPipelineError(
            "We could not identify the returned checkout. Your saved league is safe. Refresh the page to check billing before trying another payment."
          )
        );
        return;
      }

      setCheckoutReturnMessage(null);
      setIsConfirmingCheckout(true);
      try {
        const confirmation = await confirmCheckoutSession(sessionId);
        if (confirmation.status === "processing") {
          setCheckoutReturnMessage(
            confirmation.message || "Your payment is still processing. Check again shortly."
          );
          return;
        }

        if (confirmation.status === "failed") {
          clearCheckoutReturnFromUrl();
          setCheckoutStatus(null);
          setStep(Number.MAX_SAFE_INTEGER);
          setPaymentPipelineError(
            new PaymentPipelineError(
              confirmation.message ||
                "The payment pipeline did not complete. Your saved league is safe. Refresh before trying checkout again."
            )
          );
          return;
        }

        clearCheckoutReturnFromUrl();
        setCheckoutStatus(null);
        setStep(Number.MAX_SAFE_INTEGER);
        show("Payment confirmed. Creating your league...", "success");
        const billingResult = await refetchStripeState();
        if (billingResult.isError) throw billingResult.error;
        const { validationMessage, modeledData } = prepareLeagueData(leagueForm.getValues());
        if (validationMessage || !modeledData) {
          throw new PaymentPipelineError(
            `Payment completed, but the saved league could not be created. ${validationMessage || "Review the saved league details after refreshing."}`
          );
        }

        await createLeagueAndOpenAdmin(modeledData);
      } catch (error: unknown) {
        setPaymentPipelineError(
          toPaymentPipelineError(
            error,
            "We could not safely finish the payment. Your saved league is safe. Refresh before trying another payment."
          )
        );
      } finally {
        setIsConfirmingCheckout(false);
      }
    };

    void resumeLeagueCreation();
  }, [
    checkoutStatus,
    createLeagueAndOpenAdmin,
    confirmationAttempt,
    leagueForm,
    refetchStripeState,
    show,
  ]);

  const handleSubmit = () => {
    if (billingLoading) {
      show("Checking billing status. Please try again in a moment.", "warning");
      return;
    }

    const { validationMessage, modeledData } = prepareLeagueData(leagueForm.getValues());
    if (validationMessage || !modeledData) {
      show(validationMessage || "Review the league details and try again.", "error");
      return;
    }
    const includedGolfers = Number(stripeState?.billing?.includedGolfers || 0);
    const allocatedGolfers = Number(stripeState?.billing?.allocatedGolfers || 0);
    const bypassesLeaguePayment = Boolean(stripeState?.billing?.hasPendingLeagueBypass);
    const requestedGolfers = getLeagueBillableGolfers(modeledData.players);
    const targetIncludedGolfers = allocatedGolfers + requestedGolfers;

    if (!bypassesLeaguePayment && targetIncludedGolfers > includedGolfers) {
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
              void createLeagueAndOpenAdmin(modeledData).catch((error: any) => {
                show(error?.message || "Failed to create league.", "error");
              });
              return;
            }

            if (!checkout?.url) {
              setPaymentPipelineError(
                new PaymentPipelineError(
                  "The payment provider did not return a checkout URL. Your saved league is safe."
                )
              );
              return;
            }
            window.location.href = checkout.url;
          },
          onError: (error: unknown) => {
            setPaymentPipelineError(
              toPaymentPipelineError(
                error,
                "The payment pipeline could not start. Your saved league is safe."
              )
            );
          },
        }
      );
      return;
    }

    void createLeagueAndOpenAdmin(modeledData).catch((error: any) => {
      show(error?.message || "Failed to create league.", "error");
    });
  };

  const leagueData = useWatch({ control: leagueForm.control });
  const steps: LeagueWizardStep[] =
    leagueData.type === "season" && leagueData.format === "team"
      ? ["info", "players", "teams", "review"]
      : ["info", "players", "review"];
  const footerIncludedGolfers = Number(stripeState?.billing?.includedGolfers || 0);
  const footerAllocatedGolfers = Number(stripeState?.billing?.allocatedGolfers || 0);
  const footerRequestedGolfers = getLeagueBillableGolfers(leagueData.players || []);
  const footerBypassesLeaguePayment = Boolean(stripeState?.billing?.hasPendingLeagueBypass);
  const footerAdditionalGolfersRequired = Math.max(
    0,
    footerBypassesLeaguePayment
      ? 0
      : footerAllocatedGolfers + footerRequestedGolfers - footerIncludedGolfers
  );
  const finalActionLabel = footerAdditionalGolfersRequired > 0
      ? `Pay for ${footerAdditionalGolfersRequired} Golfers`
      : "Create League";
  const hasActiveCheckoutReturn =
    checkoutStatus !== null && ["registration_success", "upgrade_success"].includes(checkoutStatus);
  const currentStep = hasActiveCheckoutReturn
    ? steps.length
    : Math.max(1, Math.min(steps.length, step));

  const goToStep = (nextStep: number) => {
    setCheckoutStatus(null);
    setStep(Math.max(1, Math.min(steps.length, nextStep)));
  };

  if (paymentPipelineError) {
    throw paymentPipelineError;
  }

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
      {checkoutStatus && (isConfirmingCheckout || checkoutReturnMessage) && (
        <PaymentReturnNotice
          isChecking={isConfirmingCheckout}
          message={
            isConfirmingCheckout
              ? "Confirming your payment..."
              : checkoutReturnMessage || "We could not confirm your payment."
          }
          onRetry={() => {
            checkoutResumeStartedRef.current = false;
            setConfirmationAttempt((attempt) => attempt + 1);
          }}
        />
      )}
      <div>
        <FormProvider {...leagueForm}>
          <div className="step-body">
            {currentStep === 1 && <InfoForm />}
            {currentStep === 2 && <Players />}
            {steps.length === 4 && currentStep === 3 && <TeamsForm />}
            {((steps.length === 4 && currentStep === 4) ||
              (steps.length === 3 && currentStep === 3)) && (
              <ReviewForm
                leagueData={leagueData}
                billing={stripeState?.billing}
                isBillingLoading={billingLoading}
                onPaymentAccessGranted={() => refetchStripeState()}
              />
            )}
          </div>
        </FormProvider>
      </div>
      {currentStep <= steps.length && (
        <Stepper
          step={currentStep}
          totalSteps={steps.length}
          isSubmitting={
            createLeague.isPending ||
            createCheckoutSession.isPending ||
            billingLoading ||
            hasActiveCheckoutReturn
          }
          smoothScroll
          scrollTargetRef={topRef}
          nextLabel={
            currentStep === steps.length
              ? billingLoading
                ? "Checking Billing..."
                : finalActionLabel
              : undefined
          }
          onBack={() => {
            goToStep(Math.max(1, currentStep - 1));
          }}
          onNext={() => {
            if (currentStep === steps.length) {
              handleSubmit();
              return;
            }

            const currentStepName = steps[currentStep - 1];
            const validationMessage = validateLeagueWizardStep(
              leagueForm.getValues(),
              currentStepName,
            );
            if (validationMessage) {
              show(validationMessage, "error");
              return;
            }

            goToStep(currentStep + 1);
          }}
        />
      )}
    </div>
  );
}
