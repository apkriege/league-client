import Players from "./forms/PlayersForm";
import TeamsForm from "./forms/TeamsForm";
import ReviewForm from "./forms/ReviewForm";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useCreateLeague } from "@api/league/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { useStripeState } from "@api/payments/queries";
import { useLeagueRenewalTemplate } from "@api/league/queries";
import { useNavigate, useSearchParams } from "react-router";
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
import { clearCreateLeagueDraft, getCreateLeagueDraftStorageKey } from "./leagueDraft";
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
import type { Player, Teams } from "@/types/league";
import { addCalendarYear } from "@/features/leagues/seasonDates";
import { useAdminLeagues } from "@api/admin/queries";
import PreviousSeasonPicker from "@/features/leagues/components/PreviousSeasonPicker";

type CreateLeagueFormData = {
  name: string;
  description: string;
  numPlayers: number;
  type: string;
  holeFormat: "9" | "18" | "mixed";
  format: string | null;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: Date;
  endDate: Date;
  players: Array<Player & { phone?: string }>;
  teams: Teams[];
  renewedFromLeagueId: number | null;
  billingDraftKey: string;
  scoringPeriods: Array<{
    name: string;
    position: number;
    startDate: Date;
    endDate: Date;
  }>;
};

const getDefaultStartDate = () => new Date();
const getDefaultEndDate = (startDate = getDefaultStartDate()) => {
  return addCalendarYear(startDate);
};

const createDefaultLeagueData = (): CreateLeagueFormData => ({
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
  renewedFromLeagueId: null as number | null,
  billingDraftKey: crypto.randomUUID(),
  scoringPeriods: [],
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
  const renewalTemplateAppliedRef = useRef(false);
  const createLeague = useCreateLeague();
  const createCheckoutSession = useCreateCheckoutSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAppStore();
  const role = String(user?.role || "").toUpperCase();
  const canCreateLeague = role === "ADMIN" || role === "SUPER";
  const draftStorageKey = getCreateLeagueDraftStorageKey(Number(user?.id || 0));
  const renewalSourceIdValue = Number(searchParams.get("renewFrom") || 0);
  const renewalSourceId =
    Number.isInteger(renewalSourceIdValue) && renewalSourceIdValue > 0
      ? renewalSourceIdValue
      : 0;
  const renewalTemplateQuery = useLeagueRenewalTemplate(
    renewalSourceId,
    canCreateLeague && renewalSourceId > 0,
  );
  const previousSeasonsQuery = useAdminLeagues(canCreateLeague);
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

  const leagueForm = useForm<CreateLeagueFormData>({
    defaultValues: createDefaultLeagueData(),
  });

  useEffect(() => {
    const freshDefaultLeagueData = createDefaultLeagueData();
    const draft = window.localStorage.getItem(draftStorageKey);
    if (!draft) {
      if (renewalSourceId) return;
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
      const draftRenewalSourceId = Number(parsed?.renewedFromLeagueId || 0);
      if (renewalSourceId && draftRenewalSourceId !== renewalSourceId) {
        window.localStorage.removeItem(draftStorageKey);
        return;
      }
      if (!renewalSourceId && draftRenewalSourceId) {
        window.localStorage.removeItem(draftStorageKey);
        return;
      }
      const { access: _legacyAccess, ...parsedDraft } = parsed ?? {};
      const resolvedStartDate = parsed?.startDate
        ? new Date(parsed.startDate)
        : freshDefaultLeagueData.startDate;
      const resolvedEndDate =
        parsed?.type === "season"
          ? getDefaultEndDate(resolvedStartDate)
          : parsed?.endDate
            ? new Date(parsed.endDate)
            : getDefaultEndDate(resolvedStartDate);
      const resolvedPlayers =
        Array.isArray(parsed?.players) && parsed.players.length > 0
          ? parsed.players
          : freshDefaultLeagueData.players;
      const resolvedScoringPeriods = Array.isArray(parsed?.scoringPeriods)
        ? parsed.scoringPeriods.map((period: any) => ({
            ...period,
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate),
          }))
        : [];
      leagueForm.reset({
        ...freshDefaultLeagueData,
        ...parsedDraft,
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
        players: resolvedPlayers,
        scoringPeriods: resolvedScoringPeriods,
        billingDraftKey: parsed?.billingDraftKey || crypto.randomUUID(),
      });
      if (renewalSourceId) renewalTemplateAppliedRef.current = true;
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, leagueForm, renewalSourceId, user]);

  useEffect(() => {
    const template = renewalTemplateQuery.data?.league;
    if (!template || renewalTemplateAppliedRef.current) return;
    renewalTemplateAppliedRef.current = true;
    leagueForm.reset({
      ...createDefaultLeagueData(),
      ...template,
      startDate: new Date(template.startDate),
      endDate:
        template.type === "season"
          ? getDefaultEndDate(new Date(template.startDate))
          : new Date(template.endDate),
      players: template.players || [],
      teams: template.teams || [],
      scoringPeriods: (template.scoringPeriods || []).map((period: any) => ({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      })),
    });
  }, [leagueForm, renewalTemplateQuery.data]);

  useEffect(() => {
    const unsubscribe = leagueForm.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(values));
      },
    });

    return unsubscribe;
  }, [draftStorageKey, leagueForm]);

  const createLeagueAndOpenAdmin = useCallback(
    async (modeledData: any) => {
      const league = await createLeague.mutateAsync(modeledData);
      window.localStorage.removeItem(draftStorageKey);
      navigate(`/league/${league.id}/admin`);
    },
    [createLeague, draftStorageKey, navigate],
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
    const bypassesLeaguePayment = Boolean(stripeState?.billing?.hasPendingLeagueBypass);
    const requestedGolfers = getLeagueBillableGolfers(modeledData.players);

    if (!bypassesLeaguePayment) {
      const renewalQuery = renewalSourceId ? `&renewFrom=${renewalSourceId}` : "";
      createCheckoutSession.mutate(
        {
          purpose: "league_season",
          requestedGolfers,
          billingDraftKey: modeledData.billingDraftKey,
          renewedFromLeagueId: renewalSourceId || undefined,
          successUrl: `${window.location.origin}/leagues/create?checkout=upgrade_success${renewalQuery}`,
          cancelUrl: `${window.location.origin}/leagues/create?checkout=upgrade_cancel${renewalQuery}`,
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
  const footerRequestedGolfers = getLeagueBillableGolfers(leagueData.players || []);
  const footerBypassesLeaguePayment = Boolean(stripeState?.billing?.hasPendingLeagueBypass);
  const footerAdditionalGolfersRequired = footerBypassesLeaguePayment
    ? 0
    : footerRequestedGolfers;
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

  const handleClearPreviousSeason = () => {
    if (!user?.id) return;
    if (!window.confirm("Clear all copied season data and start with a blank league?")) return;

    clearCreateLeagueDraft(Number(user.id));
    renewalTemplateAppliedRef.current = false;
    leagueForm.reset({
      ...createDefaultLeagueData(),
      contactFirstName: user.firstName || "",
      contactLastName: user.lastName || "",
      contactEmail: user.email || "",
      contactPhone: user.phone || "",
    });
    setCheckoutStatus(null);
    setStep(1);
    navigate("/leagues/create", { replace: true });
    show("Previous-season data cleared.", "success");
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

  if (renewalSourceId && renewalTemplateQuery.isLoading) {
    return <PageState title="Preparing next season" message="Copying the league setup and roster…" />;
  }

  if (renewalSourceId && renewalTemplateQuery.isError) {
    return (
      <PageState
        title="Unable to renew this league"
        message="The previous season could not be prepared. It may already have a next season."
        variant="error"
        actionTo="/leagues"
        actionLabel="Back to Leagues"
      />
    );
  }

  return (
    <div>
      <div ref={topRef} />
      {renewalSourceId > 0 && renewalTemplateQuery.data?.sourceLeague && (
        <div className="mb-4 gap-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black">Creating the next season</p>
            <p className="mt-1 text-xs leading-5 text-sky-900/80">
              League settings, players, teams, current handicaps, and scoring periods were copied
              from <strong>{renewalTemplateQuery.data.sourceLeague.name}</strong>. Previous events,
              scores, and standings remain in that season and are not copied.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearPreviousSeason}
            className="mt-3 shrink-0 rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-950 transition hover:bg-sky-100 sm:mt-0"
          >
            Clear copied data
          </button>
        </div>
      )}
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
            {currentStep === 1 && (
              <>
                {renewalSourceId === 0 && user?.id && (
                  <PreviousSeasonPicker
                    leagues={previousSeasonsQuery.data ?? []}
                    ownerId={Number(user.id)}
                  />
                )}
                <InfoForm />
              </>
            )}
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
