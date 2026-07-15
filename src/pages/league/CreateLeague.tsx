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
import { BILLING_MIN_GOLFERS } from "@/lib/billing";
import { useAppStore } from "@/stores/appStore";
import PageState from "@/components/layout/PageState";
import { validateLeagueForm } from "./validation";

const getDefaultStartDate = () => new Date();
const getDefaultEndDate = (startDate = getDefaultStartDate()) => {
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  return endDate;
};

const defaultPlayers = [
  {
    id: 1,
    firstName: "Aiden",
    lastName: "Brooks",
    email: "aiden.brooks@test.com",
    phone: "555-0101",
    type: "player",
    handicap: 6,
  },
  {
    id: 2,
    firstName: "Mason",
    lastName: "Reed",
    email: "mason.reed@test.com",
    phone: "555-0102",
    type: "player",
    handicap: 9,
  },
  {
    id: 3,
    firstName: "Eli",
    lastName: "Carter",
    email: "eli.carter@test.com",
    phone: "555-0103",
    type: "player",
    handicap: 12,
  },
  {
    id: 4,
    firstName: "Logan",
    lastName: "Price",
    email: "logan.price@test.com",
    phone: "555-0104",
    type: "player",
    handicap: 14,
  },
  {
    id: 5,
    firstName: "Noah",
    lastName: "Walker",
    email: "noah.walker@test.com",
    phone: "555-0105",
    type: "player",
    handicap: 16,
  },
  {
    id: 6,
    firstName: "Owen",
    lastName: "James",
    email: "owen.james@test.com",
    phone: "555-0106",
    type: "player",
    handicap: 18,
  },
  {
    id: 7,
    firstName: "Caleb",
    lastName: "Dunn",
    email: "caleb.dunn@test.com",
    phone: "555-0107",
    type: "player",
    handicap: 20,
  },
  {
    id: 8,
    firstName: "Luke",
    lastName: "Foster",
    email: "luke.foster@test.com",
    phone: "555-0108",
    type: "player",
    handicap: 22,
  },
];

const createDefaultLeagueData = () => ({
  name: "",
  description: "",
  numPlayers: 0,
  type: "season",
  format: "individual",
  access: "public",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  startDate: getDefaultStartDate(),
  endDate: getDefaultEndDate(),
  players: defaultPlayers.map((player) => ({ ...player })),
  teams: [],
});

const DRAFT_STORAGE_KEY = "create-league-draft";

const modelLeagueData = (league: any) => {
  const { players, teams, ...info } = league;

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
    const draft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
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
      const resolvedStartDate = parsed?.startDate
        ? new Date(parsed.startDate)
        : freshDefaultLeagueData.startDate;
      const resolvedPlayers =
        Array.isArray(parsed?.players) && parsed.players.length > 0
          ? parsed.players
          : freshDefaultLeagueData.players;
      leagueForm.reset({
        ...freshDefaultLeagueData,
        ...parsed,
        startDate: resolvedStartDate,
        endDate: getDefaultEndDate(resolvedStartDate),
        players: resolvedPlayers,
      });
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [leagueForm, user]);

  useEffect(() => {
    const subscription = leagueForm.watch((values) => {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
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
    const requestedGolfers = Math.max(
      modeledData.players.length,
      Number(modeledData.numPlayers || 0)
    );
    const targetIncludedGolfers = allocatedGolfers + requestedGolfers;

    if (!stripeState?.billing?.hasCompletedRegistration || includedGolfers < BILLING_MIN_GOLFERS) {
      createCheckoutSession.mutate(
        {
          purpose: "registration",
          requestedGolfers: BILLING_MIN_GOLFERS,
          successUrl: `${window.location.origin}/leagues/create?checkout=registration_success`,
          cancelUrl: `${window.location.origin}/leagues/create?checkout=registration_cancel`,
        },
        {
          onSuccess: (checkout) => {
            if ((checkout as any)?.alreadyCovered) {
              refetchStripeState();
              show("Golfer slots are already covered. Creating league...", "success");
              createLeague.mutate(modeledData, {
                onSuccess: (league) => {
                  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
                  navigate(`/league/${league.id}/admin`);
                },
                onError: (error) => {
                  show((error as any)?.message || "Failed to create league.", "error");
                },
              });
              return;
            }

            if (!checkout?.url) {
              show("Could not start registration checkout. Please try again.", "error");
              return;
            }
            window.location.href = checkout.url;
          },
          onError: (error: any) => {
            show(error?.message || "Failed to start registration checkout.", "error");
          },
        }
      );
      return;
    }

    if (targetIncludedGolfers > includedGolfers) {
      createCheckoutSession.mutate(
        {
          purpose: "seat_upgrade",
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
                  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
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
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
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
  const footerRequestedGolfers = (leagueData.players || []).length;
  const footerNeedsRegistrationPayment =
    !stripeState?.billing?.hasCompletedRegistration || footerIncludedGolfers < BILLING_MIN_GOLFERS;
  const footerAdditionalGolfersRequired = Math.max(
    0,
    footerAllocatedGolfers + footerRequestedGolfers - footerIncludedGolfers
  );
  const finalActionLabel = footerNeedsRegistrationPayment
    ? `Pay for ${BILLING_MIN_GOLFERS} Golfers`
    : footerAdditionalGolfersRequired > 0
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
