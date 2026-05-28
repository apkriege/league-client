import PageHeader from "@/components/layout/PageHeader";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InfoForm from "./components/InfoForm";
import TeamsForm from "./components/TeamsForm";
import Flights from "./components/Flights";
import { useCreateLeagueEvent } from "@api/league/mutations";
import { useLeague } from "@api/league/queries";
import { useNavigate, useParams } from "react-router";
import { Flag, ShieldHalf, Trophy } from "lucide-react";
import WizardType, { type EventWizardType } from "./components/WizardType";
import MultiSeriesBuilder from "./components/MultiSeriesBuilder";

const defaultValues = {
  name: "Test Event",
  type: "regular",
  date: new Date().toISOString().split("T")[0],
  startTime: "08:30",
  interval: 10,
  courseId: 1,
  teeId: 2,
  startSide: "front",
  holes: 9,
  format: "team",
  scoringFormat: "match", // stroke, match
  ptsPerHole: 1,
  ptsPerMatch: 2,
  ptsPerTeamWin: 2,
  strokePoints: "",
  teams: [],
  flights: [],
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { leagueId } = useParams();
  const { data: league } = useLeague(Number(leagueId));
  const [wizardType, setWizardType] = useState<EventWizardType>("multi");

  const mutation = useCreateLeagueEvent();

  const eventForm = useForm({
    defaultValues: defaultValues,
  });

  const format = eventForm.watch("format");
  const scoringFormat = eventForm.watch("scoringFormat");

  useEffect(() => {
    eventForm.setValue("flights", [], { shouldDirty: true });
  }, [format, scoringFormat]);

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

  const handleSubmit = () => {
    const data = eventForm.getValues();

    const parsedLeagueId = Number(leagueId);
    if (!parsedLeagueId) {
      console.error("Missing or invalid leagueId route param.");
      return;
    }

    mutation.mutate(
      { leagueId: parsedLeagueId, data },
      {
        onSuccess: () => {
          navigate(`/league/${leagueId}`);
        },
        onError: (error) => {
          console.error("Failed to create event:", error);
        },
      }
    );
  };

  return (
    <FormProvider {...eventForm}>
      <PageHeader
        title="Create Event"
        subTitle="Fill in the event details, configure teams if needed, and set up flights before submitting."
        icon={<Trophy size={14} />}
        iconText="CREATE EVENT"
      />

      <div className="flex flex-col gap-6 pb-6 mt-6">
        <div>
          <WizardType wizardType={wizardType} setWizardType={setWizardType} />
        </div>

        {wizardType === "single" && (
          <>
            <div>
              <InfoForm />
            </div>

            {/* Teams — only for non-season team leagues */}
            {showTeamsSection && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary rounded-md p-1.5">
                    <ShieldHalf size={12} className="text-white" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                    Teams
                  </h2>
                </div>
                <TeamsForm />
              </div>
            )}

            {/* Flights */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary rounded-md p-1.5">
                  <Flag size={12} className="text-white" />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                  Flights
                </h2>
              </div>
              <Flights />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate(`/league/${leagueId}/events`)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create Event"}
              </button>
            </div>
          </>
        )}

        {wizardType === "multi" && <MultiSeriesBuilder />}
      </div>
    </FormProvider>
  );
}
