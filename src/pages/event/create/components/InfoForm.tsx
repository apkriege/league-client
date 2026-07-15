import {
  AutocompleteSelect,
  DateInput,
  Input,
  SelectableInfoCard,
  ToggleCards,
} from "@/components/form";
import { Label } from "@/components/form/Label";
import Card from "@/components/layout/Card";
import { useCoursesWithTees } from "@api/courses";
import { useLeague } from "@api/league/queries";
import { getEventDateInputValue } from "@/utils/eventDate";
import { CircleCheck, Tally5, User, Users, Zap } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useParams } from "react-router";
import { DEFAULT_STROKE_POINTS } from "../constants";

export default function InfoForm() {
  const { leagueId } = useParams();
  const { data: courses } = useCoursesWithTees();
  const { data: league } = useLeague(Number(leagueId));
  const methods = useFormContext();
  const leagueStartDate = getEventDateInputValue(league?.startDate);
  const leagueEndDate = getEventDateInputValue(league?.endDate);

  useEffect(() => {
    if (!leagueStartDate || !leagueEndDate) return;

    const eventDate = methods.getValues("date");
    if (!eventDate || eventDate < leagueStartDate) {
      methods.setValue("date", leagueStartDate, { shouldDirty: true });
      return;
    }

    if (eventDate > leagueEndDate) {
      methods.setValue("date", leagueEndDate, { shouldDirty: true });
    }
  }, [leagueStartDate, leagueEndDate, methods]);

  if (!courses) return null;

  const courseOptions = courses.map((course: any) => ({
    value: course.id,
    label: course.name,
    content: (
      <div className="flex flex-col">
        <span>
          {course.name}, {course.location}
        </span>
        <span className="text-[10px] text-gray-500">
          {course.par} &bull; {course.numHoles} HOLES
        </span>
      </div>
    ),
  }));

  const getTeeOptions = () => {
    const selectedCourse = courses.find((course: any) => course.id === methods.watch("courseId"));
    if (!selectedCourse) return [];

    return selectedCourse.tees
      .slice()
      .sort((a: any, b: any) => Number(b.distance || 0) - Number(a.distance || 0))
      .map((tee: any) => ({
        value: tee.id,
        body: (
          <div className="flex flex-col">
            <span>{tee.name}</span>
            <span className="text-[10px] text-gray-500">
              {tee.par} &bull; {tee.distance} yards
            </span>
          </div>
        ),
      }));
  };

  const isSeasonLeague = String(league?.type || "").toLowerCase() === "season";
  const lockedSeasonFormat = String(league?.format || "").toLowerCase();
  const isFormatLocked = isSeasonLeague && ["individual", "team"].includes(lockedSeasonFormat);
  const isTeamFormat = methods.watch("format") === "team";
  const scoringFormat = methods.watch("scoringFormat");
  const pointsEnabled = methods.watch("pointsEnabled") !== false;
  const selectScoringFormat = (nextScoringFormat: "stroke" | "match") => {
    methods.setValue("scoringFormat", nextScoringFormat);

    if (nextScoringFormat === "stroke" && !String(methods.getValues("strokePoints") || "").trim()) {
      methods.setValue("strokePoints", DEFAULT_STROKE_POINTS, { shouldDirty: true });
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-2/3 flex flex-col gap-5">
        <Card>
          <h3 className="text-lg font-bold">Event Details</h3>
          <p className="text-sm text-gray-500">
            Set up the details for your event, including date, time, and format.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Event Name"
                placeholder="e.g. January Open"
                {...methods.register("name", { required: "Event name is required" })}
              />
              <DateInput
                label="Event Date"
                min={leagueStartDate || undefined}
                max={leagueEndDate || undefined}
                {...methods.register("date", { required: "Event date is required" })}
              />
            </div>
            {isFormatLocked ? (
              <div className="rounded-lg border border-base-300 px-3 py-2 text-xs">
                Event format is locked to
                <span className="font-semibold ml-1 uppercase">{lockedSeasonFormat}</span>
                <span className="text-base-content/60 ml-1">by league season settings.</span>
              </div>
            ) : (
              <ToggleCards
                value={methods.watch("format")}
                onChange={(value) => methods.setValue("format", value)}
                options={[
                  { value: "individual", label: "INDIVIDUAL", icon: <User /> },
                  { value: "team", label: "TEAM PLAY", icon: <Users /> },
                ]}
              />
            )}
          </div>
        </Card>
        <Card>
          <div>
            <h3 className="text-lg font-bold">Course Selection</h3>
            <p className="text-sm text-gray-500">
              Set up the details for your event, including date, time, and format.
            </p>
            <AutocompleteSelect
              label="Course"
              placeholder="Select a course"
              options={courseOptions}
              onChange={(value) => methods.setValue("courseId", value)}
              value={methods.watch("courseId")}
            />
          </div>
          {methods.watch("courseId") && (
            <div className="w-full">
              <div>
                <Label text="Tee" />
                <ToggleCards
                  value={methods.watch("teeId")}
                  onChange={(value) => methods.setValue("teeId", value)}
                  options={getTeeOptions()}
                  className="max-grid-cols-2!"
                />
              </div>
            </div>
          )}
          <div className="w-full">
            <Label text="Starting Side" />
            <ToggleCards
              value={methods.watch("startSide")}
              onChange={(value) => methods.setValue("startSide", value)}
              options={[
                { value: "front", label: "FRONT" },
                { value: "back", label: "BACK" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="Interval (minutes)"
              type="number"
              {...methods.register("interval", {
                required: "Interval is required",
                valueAsNumber: true,
                min: { value: 1, message: "Interval must be at least 1 minute" },
              })}
            />
            <Input
              label="Start Time"
              type="time"
              {...methods.register("startTime", { required: "Start time is required" })}
            />
            <div>
              <Label text="Holes" />
              <ToggleCards
                value={String(methods.watch("holes"))}
                onChange={(value) => methods.setValue("holes", Number(value))}
                options={[
                  { value: "9", label: "9" },
                  { value: "18", label: "18" },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>
      <div className="w-1/3 flex flex-col gap-5">
        <Card>
          <h3 className="text-lg font-bold">Scoring</h3>
          <p className="text-sm text-gray-500">Choose how you want to score your event.</p>

          <div className="mt-4">
            <div>
              <Label text="Scoring Format" />
              <div className="flex flex-col gap-2">
                <SelectableInfoCard
                  active={scoringFormat === "stroke"}
                  onClick={() => selectScoringFormat("stroke")}
                  icon={<Tally5 size={26} />}
                  title="Stroke Play"
                  description={
                    isTeamFormat
                      ? "Best-ball stroke play. Each team uses its best net score on each hole."
                      : "Each player records total strokes. Lowest total wins."
                  }
                  activeIndicator={<CircleCheck size={26} />}
                />
                <SelectableInfoCard
                  active={scoringFormat === "match"}
                  onClick={() => selectScoringFormat("match")}
                  icon={<Zap size={26} />}
                  title="Match Play"
                  description={
                    isTeamFormat
                      ? "2-man team match play. Teams compete hole-by-hole with match bonuses."
                      : "Players compete hole-by-hole. Hole wins and match wins award points."
                  }
                  activeIndicator={<CircleCheck size={26} />}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            {scoringFormat === "stroke" && (
              <>
                <label className="mb-3 flex items-start gap-2 rounded-lg border border-base-300 bg-white px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    checked={pointsEnabled}
                    onChange={(event) =>
                      methods.setValue("pointsEnabled", event.target.checked, { shouldDirty: true })
                    }
                    className="checkbox checkbox-primary checkbox-sm mt-0.5"
                  />
                  <span>
                    <span className="block font-semibold text-base-content">Award points</span>
                    <span className="block text-base-content/60">
                      Turn this off for tournament events where the leaderboard should rank by net score only.
                    </span>
                  </span>
                </label>
                <Input
                  label="Stroke Points (CSV)"
                  placeholder={`e.g. ${DEFAULT_STROKE_POINTS}`}
                  disabled={!pointsEnabled}
                  {...methods.register("strokePoints")}
                />
                <p className="text-[11px] text-base-content/60 mt-1">
                  {pointsEnabled
                    ? "Optional. Leave blank to use Stableford scoring."
                    : "Points are disabled; this event leaderboard will use low net."}
                </p>
              </>
            )}
            {scoringFormat === "match" && (
              <>
                <Input
                  label="Points Per Hole"
                  type="number"
                  {...methods.register("ptsPerHole", {
                    required: "Points per hole win is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be at least 0 points" },
                  })}
                />
                <Input
                  label="Points Per Match"
                  type="number"
                  {...methods.register("ptsPerMatch", {
                    required: "Points per player win is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be at least 0 points" },
                  })}
                />
                <Input
                  label={isTeamFormat ? "Points Per Team Win" : "Points Per Side Win"}
                  type="number"
                  {...methods.register("ptsPerTeamWin", {
                    required: "Points per team win is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be at least 0 points" },
                  })}
                />
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
