import Button from "@/components/layout/Button";
import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import InfoForm from "./components/InfoForm";
import TeamsForm from "./components/TeamsForm";
import Flights from "./components/Flights";
import { useCreateLeagueEvent } from "@api/league/mutations";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useToast } from "@/context/useToast";
import { useNavigate, useParams } from "react-router";
import { Flag, ShieldHalf } from "lucide-react";
import WizardType, { type EventWizardType } from "./components/WizardType";
import MultiSeriesBuilder from "./components/MultiSeriesBuilder";
import { DEFAULT_STROKE_POINTS } from "./constants";
import { validateEventForm } from "./validation";
import {
  getFixedEventHoleCount,
  normalizeLeagueHoleFormat,
} from "@/features/leagues/leagueHoleFormat";

const defaultValues = {
  name: "",
  type: "regular",
  date: new Date().toISOString().split("T")[0],
  startTime: "08:30",
  interval: 10,
  courseId: "",
  teeId: "",
  startSide: "front",
  holes: 9,
  format: "team",
  scoringFormat: "match", // stroke, match
  ptsPerHole: 1,
  ptsPerMatch: 2,
  ptsPerTeamWin: 2,
  strokePoints: DEFAULT_STROKE_POINTS,
  pointsEnabled: true,
  teams: [],
  flights: [],
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { leagueId } = useParams();
  const { show } = useToast();
  const { data: league, isLoading, isError, error } = useLeague(Number(leagueId));
  const [wizardType, setWizardType] = useState<EventWizardType>("multi");

  const mutation = useCreateLeagueEvent();

  const eventForm = useForm({
    defaultValues: defaultValues,
  });

  const format = useWatch({ control: eventForm.control, name: "format" });
  const scoringFormat = useWatch({ control: eventForm.control, name: "scoringFormat" });
  const leagueHoleFormat = normalizeLeagueHoleFormat(league?.holeFormat);
  const fixedEventHoleCount = getFixedEventHoleCount(leagueHoleFormat);
  const isMixedHoleLeague = leagueHoleFormat === "mixed";
  const activeWizardType = isMixedHoleLeague ? "single" : wizardType;

  useEffect(() => {
    eventForm.setValue("flights", [], { shouldDirty: true });
  }, [eventForm, format, scoringFormat]);

  useEffect(() => {
    if (!fixedEventHoleCount) return;
    eventForm.setValue("holes", fixedEventHoleCount, { shouldDirty: true });
  }, [eventForm, fixedEventHoleCount]);

  const isSeasonLeague = String(league?.type || "").toLowerCase() === "season";
  const leagueFormat = String(league?.format || "").toLowerCase();
  const isSeasonTeamLeague = isSeasonLeague && leagueFormat === "team";
  const showTeamsSection = format === "team" && !isSeasonTeamLeague;

  useEffect(() => {
    if (!league) return;

    const isSeason = String(league.type || "").toLowerCase() === "season";
    const lf = String(league.format || "").toLowerCase();

    if (isSeason && (lf === "team" || lf === "individual")) {
      eventForm.setValue("format", lf, { shouldDirty: true });

      if (lf === "team") {
        const mappedTeams = (league.teams || []).map((team: any) => ({
          id: Number(team.id),
          name: team.name,
          players: (team.players || []).map((p: any) => Number(p.id)),
        }));

        eventForm.setValue("teams", mappedTeams, { shouldDirty: true });
      }
    }
  }, [league, eventForm]);

  const handleSubmit = eventForm.handleSubmit((data) => {
    const parsedLeagueId = Number(leagueId);
    if (!parsedLeagueId) {
      show("Missing or invalid league ID. Reload and try again.", "error");
      return;
    }

    const validationMessage = validateEventForm(data, {
      showTeamsSection,
      leagueStartDate: league?.startDate,
      leagueEndDate: league?.endDate,
    });
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    mutation.mutate(
      { leagueId: parsedLeagueId, data },
      {
        onSuccess: () => {
          navigate(`/league/${leagueId}/admin`);
        },
        onError: (error: unknown) => {
          show(getApiErrorMessage(error, "Unable to create the event. Please try again."), "error");
        },
      }
    );
  }, (errors) => {
    const firstError = Object.values(errors)[0] as any;
    show(firstError?.message || "Please fix the required event fields.", "error");
  });

  if (isLoading) {
    return (
      <LoadingState>
        Loading league...
      </LoadingState>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "League Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Event Builder"
        }
        message={getApiErrorMessage(error, "The event builder could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (!league) {
    return (
      <PageState
        title="League Not Found"
        message="The event builder could not be loaded because the league was not found."
        variant="notFound"
      />
    );
  }

  return (
    <FormProvider {...eventForm}>
      <PageHeader
        title="Create Event"
        subTitle="Fill in the event details, configure teams if needed, and set up flights before submitting."
      />

      <div className="flex flex-col gap-6 pb-6 mt-6">
        <div>
          <WizardType
            wizardType={activeWizardType}
            setWizardType={setWizardType}
            allowMulti={!isMixedHoleLeague}
          />
        </div>

        {activeWizardType === "single" && (
          <>
            <div>
              <InfoForm />
            </div>

            {/* Teams — only for non-season team leagues */}
            {showTeamsSection && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-slate-900 rounded-md p-1.5">
                    <ShieldHalf size={12} className="text-white" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900/60">
                    Teams
                  </h2>
                </div>
                <TeamsForm />
              </div>
            )}

            {/* Flights */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-slate-900 rounded-md p-1.5">
                  <Flag size={12} className="text-white" />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900/60">
                  Flights
                </h2>
              </div>
              <Flights />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => navigate(`/league/${leagueId}/admin`)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </>
        )}

        {activeWizardType === "multi" && <MultiSeriesBuilder />}
      </div>
    </FormProvider>
  );
}
