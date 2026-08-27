import Button from "@/components/layout/Button";
import ScoringPeriodDivider from "@/components/league/ScoringPeriodDivider";
import { useState, useCallback, useEffect, useMemo, Fragment } from "react";
import { useFormContext } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import {
  CalendarDays,
  CalendarRange,
  RefreshCw,
  ShieldHalf,
  Shuffle,
  CircleCheck,
  Tally5,
  User,
  Users,
  Zap,
} from "lucide-react";

import Card from "@/components/layout/Card";
import {
  AutocompleteSelect,
  DateInput,
  Input,
  SelectableInfoCard,
  ToggleCards,
} from "@/components/form";
import { Label } from "@/components/form/Label";
import { FlightsDragRow } from "./FlightsDragRow";
import TeamsForm from "./TeamsForm";
import { useLeague } from "@api/league/queries";
import { useCoursesWithTees } from "@api/courses";
import { useCreateLeagueEvents } from "@api/league/mutations";
import { useToast } from "@/context/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { getEventDateInputValue } from "@/utils/eventDate";
import { getScoringPeriodBoundariesBeforeEvent } from "@/features/leagues/scoringPeriodBoundaries";
import type { LeagueScoringPeriod } from "@/types/league";
import { DEFAULT_STROKE_POINTS } from "../constants";
import {
  buildDates,
  buildFlights,
  generateRoundRobin,
  shuffleArray,
  type ScheduleRound,
} from "../multiSeriesSchedule";
import { createCourseAutocompleteOptions } from "../courseAutocompleteOptions";
import MuiCheckbox from "@mui/material/Checkbox";
import {
  getFixedEventHoleCount,
  normalizeLeagueHoleFormat,
} from "@/features/leagues/leagueHoleFormat";
import {
  buildHalfScoringPeriods,
  suggestFirstHalfEndDate,
} from "../scoringPeriods";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MultiSeriesBuilder() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: league } = useLeague(Number(leagueId));
  const { data: courses } = useCoursesWithTees();
  const methods = useFormContext();
  const leagueStartDate = getEventDateInputValue(league?.startDate);
  const leagueEndDate = getEventDateInputValue(league?.endDate);
  const leagueHoleFormat = normalizeLeagueHoleFormat(league?.holeFormat);
  const fixedEventHoleCount = getFixedEventHoleCount(leagueHoleFormat);
  const availableCourses = (courses || []).filter(
    (course: any) => fixedEventHoleCount !== 18 || Number(course.numHoles) >= 18
  );
  const selectedCourse = availableCourses.find(
    (course: any) => Number(course.id) === Number(methods.watch("courseId"))
  );
  const isNineHoleCourse = Number(selectedCourse?.numHoles) <= 9;

  // Shared settings from the parent form context
  const format: string = methods.watch("format") || "team";
  const scoringFormat: string = methods.watch("scoringFormat") || "match";
  const pointsEnabled = methods.watch("pointsEnabled") !== false;
  const selectScoringFormat = (nextScoringFormat: "stroke" | "match") => {
    methods.setValue("scoringFormat", nextScoringFormat);

    if (nextScoringFormat === "stroke" && !String(methods.getValues("strokePoints") || "").trim()) {
      methods.setValue("strokePoints", DEFAULT_STROKE_POINTS, { shouldDirty: true });
    }
  };
  const isTeamFormat = format === "team";
  const teams: any[] = methods.watch("teams") || [];
  const players: any[] = league?.players || [];

  const isSeasonLeague = String(league?.type || "").toLowerCase() === "season";
  const lockedSeasonFormat = String(league?.format || "").toLowerCase();
  const isFormatLocked = isSeasonLeague && ["individual", "team"].includes(lockedSeasonFormat);
  const showTeams = format === "team" && !isSeasonLeague;

  // Source ids for schedule generation
  const ids =
    format === "team" ? teams.map((t: any) => Number(t.id)) : players.map((p: any) => Number(p.id));

  // Number of rounds needed for a full round-robin
  const rrRounds = ids.length >= 2 ? (ids.length % 2 === 0 ? ids.length - 1 : ids.length) : 0;

  // Series config state
  const defaultStartDate = dayjs().add(7, "day").format("YYYY-MM-DD");
  const [seriesName, setSeriesName] = useState("Weekly Series");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(
    dayjs()
      .add(7 + 7 * 7, "day")
      .format("YYYY-MM-DD")
  );
  const [frequency, setFrequency] = useState<"weekly" | "biweekly">("weekly");
  const [selectedDays, setSelectedDays] = useState<number[]>([dayjs(defaultStartDate).day()]);
  const [schedule, setSchedule] = useState<ScheduleRound[]>([]);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [alternateStartSides, setAlternateStartSides] = useState(false);
  const existingScoringPeriods = useMemo(
    () => (Array.isArray(league?.scoringPeriods) ? league.scoringPeriods : []),
    [league]
  );
  const [statsPeriodMode, setStatsPeriodMode] = useState<"overall" | "halves">(() =>
    existingScoringPeriods.length === 2 ? "halves" : "overall"
  );
  const [firstHalfEndDate, setFirstHalfEndDate] = useState(() =>
    existingScoringPeriods.length === 2
      ? getEventDateInputValue(existingScoringPeriods[0]?.endDate)
      : ""
  );
  const hasUnsupportedScoringPeriods =
    existingScoringPeriods.length > 0 && existingScoringPeriods.length !== 2;
  const scoringPeriodsLocked =
    Boolean(league?.hasRecordedScores) || hasUnsupportedScoringPeriods;

  const clampToLeagueDates = useCallback(
    (date: string) => {
      if (leagueStartDate && date < leagueStartDate) return leagueStartDate;
      if (leagueEndDate && date > leagueEndDate) return leagueEndDate;
      return date;
    },
    [leagueStartDate, leagueEndDate]
  );

  const resolvedStartDate = clampToLeagueDates(startDate);
  const clampedEndDate = clampToLeagueDates(endDate);
  const resolvedEndDate = clampedEndDate < resolvedStartDate ? resolvedStartDate : clampedEndDate;
  const resolvedSchedule = useMemo(
    () =>
      schedule.map((round) => ({
        ...round,
        date: clampToLeagueDates(round.date),
      })),
    [clampToLeagueDates, schedule]
  );
  const previewScoringPeriods = useMemo<LeagueScoringPeriod[]>(() => {
    if (statsPeriodMode !== "halves") return [];

    const configuredPeriods = scoringPeriodsLocked
      ? existingScoringPeriods
      : buildHalfScoringPeriods(resolvedStartDate, resolvedEndDate, firstHalfEndDate) ?? [];

    return configuredPeriods.map((period: any, index: number) => {
      const storedId = Number(period.id);
      return {
        id: Number.isFinite(storedId) ? storedId : -(index + 1),
        name: String(period.name),
        position: Number(period.position ?? index + 1),
        startDate: period.startDate,
        endDate: period.endDate,
      };
    });
  }, [
    existingScoringPeriods,
    firstHalfEndDate,
    resolvedEndDate,
    resolvedStartDate,
    scoringPeriodsLocked,
    statsPeriodMode,
  ]);

  useEffect(() => {
    if (fixedEventHoleCount) {
      methods.setValue("holes", fixedEventHoleCount, { shouldDirty: true });
    }
    if (isNineHoleCourse) {
      methods.setValue("startSide", "front", { shouldDirty: true });
    }
  }, [fixedEventHoleCount, isNineHoleCourse, methods]);

  const sharedStartSide = methods.watch("startSide") === "back" ? "back" : "front";
  const getEventStartSide = (index: number) => {
    if (isNineHoleCourse || !alternateStartSides) return sharedStartSide;
    return index % 2 === 0 ? sharedStartSide : sharedStartSide === "front" ? "back" : "front";
  };

  const generatedDates = buildDates(resolvedStartDate, resolvedEndDate, selectedDays, frequency);
  const eventCount = generatedDates.length;

  const mutation = useCreateLeagueEvents(() => {
    show(`${resolvedSchedule.length} events created!`, "success");
    navigate(`/league/${leagueId}/admin`);
  });

  // Course / tee options
  const courseOptions = createCourseAutocompleteOptions(availableCourses);

  const selectedTee = (selectedCourse?.tees || []).find(
    (t: any) => Number(t.id) === Number(methods.watch("teeId"))
  );
  const teeOptions = (selectedCourse?.tees || [])
    .slice()
    .sort((a: any, b: any) => Number(b.distance || 0) - Number(a.distance || 0))
    .map((t: any) => ({
      value: t.id,
      body: (
        <div className="flex flex-col">
          <span>{t.name}</span>
          <span className="text-[10px] text-gray-500">
            {t.par} &bull; {t.distance} yards
          </span>
        </div>
      ),
    }));

  // ---------------------------------------------------------------------------
  // Schedule generation
  // ---------------------------------------------------------------------------

  const handleGenerate = (doShuffle = false) => {
    if (ids.length < 2) {
      show(`Add at least 2 ${format === "team" ? "teams" : "players"} before generating.`, "error");
      return;
    }
    const sourceIds = doShuffle ? shuffleArray(ids) : ids;
    const rrData = generateRoundRobin(sourceIds);
    const dates = buildDates(resolvedStartDate, resolvedEndDate, selectedDays, frequency);
    if (!dates.length) {
      show("Select at least one day of the week within the date range.", "error");
      return;
    }

    if (
      statsPeriodMode === "halves" &&
      !scoringPeriodsLocked &&
      (!firstHalfEndDate || firstHalfEndDate < resolvedStartDate || firstHalfEndDate >= resolvedEndDate)
    ) {
      setFirstHalfEndDate(suggestFirstHalfEndDate(dates, resolvedStartDate));
    }

    setSchedule(
      dates.map((date, i) => ({
        date,
        flights: buildFlights(rrData[i % rrData.length] ?? [], format, scoringFormat),
      }))
    );
  };

  const updateDate = (i: number, date: string) =>
    setSchedule((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, date: clampToLeagueDates(date) } : r))
    );

  const updateFlights = (i: number, flights: any[]) =>
    setSchedule((prev) => prev.map((r, idx) => (idx === i ? { ...r, flights } : r)));

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = () => {
    if (!resolvedSchedule.length) {
      show("Generate a schedule first.", "error");
      return;
    }
    const outsideLeagueDate = resolvedSchedule.find(
      (round) =>
        (leagueStartDate && round.date < leagueStartDate) ||
        (leagueEndDate && round.date > leagueEndDate)
    );
    if (outsideLeagueDate) {
      show("Event dates must stay within the league start and end dates.", "error");
      return;
    }
    const shared = methods.getValues();
    const halfScoringPeriods = buildHalfScoringPeriods(
      resolvedStartDate,
      resolvedEndDate,
      firstHalfEndDate
    );
    if (statsPeriodMode === "halves" && !scoringPeriodsLocked && !halfScoringPeriods) {
      show("Choose a first-half end date before the series end date.", "error");
      return;
    }

    mutation.mutate(
      {
        leagueId: Number(leagueId),
        scoringPeriods: scoringPeriodsLocked
          ? undefined
          : statsPeriodMode === "halves"
            ? halfScoringPeriods ?? []
            : [],
        events: resolvedSchedule.map((r, i) => ({
          name: `${seriesName} - Round ${i + 1}`,
          type: "regular",
          date: r.date,
          startTime: shared.startTime,
          interval: shared.interval,
          courseId: shared.courseId,
          teeId: shared.teeId,
          startSide: getEventStartSide(i),
          holes: shared.holes,
          format: shared.format,
          scoringFormat: shared.scoringFormat,
          pointsEnabled: shared.pointsEnabled,
          ptsPerHole: shared.ptsPerHole,
          ptsPerMatch: shared.ptsPerMatch,
          ptsPerTeamWin: shared.ptsPerTeamWin,
          strokePoints: shared.strokePoints,
          teams: shared.teams,
          flights: r.flights,
        })),
      },
      {
        onError: (error: unknown) => {
          show(
            getApiErrorMessage(error, "Unable to create the event series. Please try again."),
            "error"
          );
        },
      }
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* ── Event Settings + Scoring ── */}
      <div className="flex gap-4">
        <div className="w-2/3 flex flex-col gap-5">
          <Card>
            <h3 className="text-base font-semibold mb-1">Event Settings</h3>
            <p className="text-xs text-slate-900/60 mb-4">
              These settings apply to every event in the series.
            </p>

            <div className="flex flex-col gap-4">
              {isFormatLocked ? (
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                  Format locked to{" "}
                  <span className="font-semibold uppercase ml-1">{lockedSeasonFormat}</span>
                  <span className="text-slate-900/60 ml-1">by league settings.</span>
                </div>
              ) : (
                <div>
                  <Label text="Format" />
                  <ToggleCards
                    value={format}
                    onChange={(v) => methods.setValue("format", v)}
                    options={[
                      { value: "individual", label: "INDIVIDUAL", icon: <User size={14} /> },
                      { value: "team", label: "TEAM PLAY", icon: <Users size={14} /> },
                    ]}
                  />
                </div>
              )}

              <AutocompleteSelect
                label="Course"
                placeholder="Search by course, club, or location"
                options={courseOptions}
                noResultsText="No matching courses"
                denseOptions
                onChange={(v) => {
                  if (Number(v) !== Number(methods.getValues("courseId"))) {
                    methods.setValue("teeId", undefined, { shouldDirty: true });
                  }
                  methods.setValue("courseId", v, { shouldDirty: true });
                }}
                value={methods.watch("courseId")}
              />
              <Link
                to="/courses"
                className="-mt-3 block w-full text-right text-[10px] font-medium text-sky-700 hover:text-sky-900 hover:underline"
              >
                Can't find your course?
              </Link>

              {methods.watch("courseId") && teeOptions.length > 0 && (
                <div>
                  <Label text="Tee" />
                  <ToggleCards
                    value={methods.watch("teeId")}
                    onChange={(v) => methods.setValue("teeId", v)}
                    options={teeOptions}
                    className="max-grid-cols-2!"
                  />
                </div>
              )}

              <div>
                <Label text="Starting Side" />
                <ToggleCards
                  value={methods.watch("startSide")}
                  onChange={(v) => methods.setValue("startSide", v)}
                  options={[
                    { value: "front", label: "FRONT" },
                    ...(!isNineHoleCourse ? [{ value: "back", label: "BACK" }] : []),
                  ]}
                />
                {!isNineHoleCourse && (
                  <label className="mt-2 flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                    <MuiCheckbox
                      checked={alternateStartSides}
                      onChange={(e) => setAlternateStartSides(e.target.checked)}
                      size="small"
                      sx={{ mt: -0.5, p: 0.5 }}
                    />
                    <span>
                      <span className="block font-semibold text-slate-900">
                        Alternate front/back each event
                      </span>
                      <span className="block text-slate-900/60">
                        Event 1 starts on {sharedStartSide}; event 2 starts on{" "}
                        {sharedStartSide === "front" ? "back" : "front"}, then repeats.
                      </span>
                    </span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input label="Start Time" type="time" {...methods.register("startTime")} />
                <Input
                  label="Interval (min)"
                  type="number"
                  {...methods.register("interval", { valueAsNumber: true })}
                />
                <div>
                  <Label text="Holes" />
                  <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                    <span className="font-semibold">{fixedEventHoleCount ?? 18} holes</span>
                    <span className="ml-1 text-slate-900/60">locked by league settings.</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="w-1/3 flex flex-col gap-5">
          {/* ── Scoring ── */}
          <Card>
            <h3 className="text-lg font-bold">Scoring</h3>
            <p className="text-sm text-gray-500">Choose how you want to score each event.</p>

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
                        ? "Best-ball stroke play. Teams use their best net score on each hole."
                        : "Players record total strokes. Lowest total wins."
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
                        ? "2-man team match play with hole and match points."
                        : "Individual match play with hole and match points."
                    }
                    activeIndicator={<CircleCheck size={26} />}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              {scoringFormat === "stroke" && (
                <>
                  <label className="mb-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                    <MuiCheckbox
                      checked={pointsEnabled}
                      onChange={(event) =>
                        methods.setValue("pointsEnabled", event.target.checked, {
                          shouldDirty: true,
                        })
                      }
                      size="small"
                      sx={{ mt: -0.5, p: 0.5 }}
                    />
                    <span>
                      <span className="block font-semibold text-slate-900">Award points</span>
                      <span className="block text-slate-900/60">
                        Turn this off when each event should rank by net score only.
                      </span>
                    </span>
                  </label>
                  <Input
                    label="Stroke Points (CSV)"
                    placeholder={`e.g. ${DEFAULT_STROKE_POINTS}`}
                    disabled={!pointsEnabled}
                    {...methods.register("strokePoints")}
                  />
                  <p className="text-[11px] text-slate-900/60 mt-1">
                    {pointsEnabled
                      ? "Optional. Leave blank to use Stableford scoring."
                      : "Points are disabled; event leaderboards will use low net."}
                  </p>
                </>
              )}
              {scoringFormat === "match" && (
                <>
                  <Input
                    label="Points Per Hole"
                    type="number"
                    {...methods.register("ptsPerHole", { valueAsNumber: true })}
                  />
                  <Input
                    label="Points Per Match"
                    type="number"
                    {...methods.register("ptsPerMatch", { valueAsNumber: true })}
                  />
                  <Input
                    label="Points Per Team Win"
                    type="number"
                    {...methods.register("ptsPerTeamWin", { valueAsNumber: true })}
                  />
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Teams ── */}
      {showTeams && (
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

      {/* ── Schedule Builder ── */}
      <Card>
        <h3 className="text-base font-semibold mb-1">Schedule Builder</h3>
        <p className="text-xs text-slate-900/60 mb-4">
          Configure your series then generate a round-robin schedule. Drag flights within a round to
          reorder tee times.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <Input
            label="Series Name"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
          />
          <DateInput
            label="Start Date"
            value={resolvedStartDate}
            min={leagueStartDate || undefined}
            max={leagueEndDate || undefined}
            onChange={(e) => {
              const nextStartDate = clampToLeagueDates(e.target.value);
              setStartDate(nextStartDate);
              if (dayjs(resolvedEndDate).isBefore(dayjs(nextStartDate), "day")) {
                setEndDate(nextStartDate);
              }
            }}
          />
          <DateInput
            label="End Date"
            value={resolvedEndDate}
            min={
              leagueStartDate && leagueStartDate > resolvedStartDate
                ? leagueStartDate
                : resolvedStartDate
            }
            max={leagueEndDate || undefined}
            onChange={(e) => setEndDate(clampToLeagueDates(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <Label text="Stats View" />
            {scoringPeriodsLocked ? (
              <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                {statsPeriodMode === "halves"
                  ? `Two halves · 1st Half through ${dayjs(firstHalfEndDate).format("MMM D, YYYY")}`
                  : hasUnsupportedScoringPeriods
                    ? existingScoringPeriods.map((period: any) => period.name).join(" · ")
                    : "Full season only"}
              </div>
            ) : (
              <ToggleCards
                value={statsPeriodMode}
                onChange={(value) => {
                  const nextMode = value as "overall" | "halves";
                  setStatsPeriodMode(nextMode);
                  if (nextMode === "halves" && !firstHalfEndDate) {
                    setFirstHalfEndDate(
                      suggestFirstHalfEndDate(generatedDates, resolvedStartDate)
                    );
                  }
                }}
                options={[
                  { value: "overall", label: "FULL SEASON", icon: <CalendarDays size={14} /> },
                  { value: "halves", label: "TWO HALVES", icon: <CalendarRange size={14} /> },
                ]}
              />
            )}
            {statsPeriodMode === "halves" && (
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <DateInput
                  label="1st Half Ends"
                  value={firstHalfEndDate}
                  min={resolvedStartDate}
                  max={dayjs(resolvedEndDate).subtract(1, "day").format("YYYY-MM-DD")}
                  disabled={scoringPeriodsLocked}
                  onChange={(event) => setFirstHalfEndDate(event.target.value)}
                />
                <div>
                  <Label text="2nd Half Begins" />
                  <div className="flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600">
                    {firstHalfEndDate
                      ? dayjs(firstHalfEndDate).add(1, "day").format("MMM D, YYYY")
                      : "Select a cutoff date"}
                  </div>
                </div>
                <p className="col-span-2 text-[11px] text-slate-500">
                  This only separates the statistics shown on the league page. Flights and
                  matchups continue normally.
                </p>
              </div>
            )}
          </div>
          <div>
            <Label text="Frequency" />
            <ToggleCards
              value={frequency}
              onChange={(v) => setFrequency(v as "weekly" | "biweekly")}
              options={[
                { value: "weekly", label: "WEEKLY" },
                { value: "biweekly", label: "BI-WEEKLY" },
              ]}
            />
          </div>
          <div>
            <Label text="Days of Week" />
            <div className="flex flex-wrap gap-1.5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <Button
                  key={day}
                  type="button"
                  variant={selectedDays.includes(i) ? "primary" : "default"}
                  outline={!selectedDays.includes(i)}
                  size="sm"
                  onClick={() =>
                    setSelectedDays((prev) =>
                      prev.includes(i)
                        ? prev.filter((d) => d !== i)
                        : [...prev, i].sort((a, b) => a - b)
                    )
                  }
                >
                  {day}
                </Button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-900/50">
              Select one or more weekdays. Weekly uses every matching week; bi-weekly uses every
              other matching week.
            </p>
          </div>
        </div>

        {rrRounds > 0 && selectedDays.length > 0 && (
          <p className="text-xs text-slate-900/50 mb-2 mt-2">
            {ids.length} {format === "team" ? "teams" : "players"} &rarr; {rrRounds}-round
            round-robin &bull; <span className="font-medium">{eventCount} events</span> scheduled
          </p>
        )}
        {ids.length < 2 && (
          <p className="text-xs text-amber-500 mb-2">
            Add at least 2 {format === "team" ? "teams above" : "players to the league"} to generate
            a schedule.
          </p>
        )}

        <div className="flex gap-2 mt-2">
          <Button type="button" variant="primary" onClick={() => handleGenerate(false)}>
            <RefreshCw size={12} className="mr-2" />
            Generate Schedule
          </Button>
          {resolvedSchedule.length > 0 && (
            <Button type="button" variant="secondary" onClick={() => handleGenerate(true)}>
              <Shuffle size={12} className="mr-2" />
              Shuffle Matchups
            </Button>
          )}
        </div>
      </Card>

      {/* ── Schedule rounds ── */}
      {resolvedSchedule.length > 0 && (
        <div className="flex gap-4 items-start">
          {/* Sticky highlight selector */}
          <div className="sticky top-4 w-48 shrink-0">
            <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
              <div className="px-3 py-2.5 border-b bg-slate-100/40">
                <p className="text-[10px] font-semibold tracking-wide text-slate-900/50">
                  {format === "team" ? "Filter by Team" : "Filter by Player"}
                </p>
                <p className="mt-1 text-[9px] leading-3 text-slate-500">
                  Drag a flight card left or right to change its order and starting time.
                </p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {format === "team" && teams.length > 0
                  ? teams.map((t: any) => {
                      const tid = Number(t.id);
                      const active = highlightId === tid;
                      return (
                        <Button
                          key={tid}
                          type="button"
                          onClick={() => setHighlightId(active ? null : tid)}
                          variant={active ? "primary" : "default"}
                          outline={!active}
                          size="xs"
                          className="w-full justify-start font-normal duration-300"
                        >
                          {active && <span className="mr-1">●</span>}
                          {t.name}
                        </Button>
                      );
                    })
                  : null}
                {format === "individual" && players.length > 0
                  ? players.map((p: any) => {
                      const pid = Number(p.id);
                      const active = highlightId === pid;
                      return (
                        <Button
                          key={pid}
                          type="button"
                          onClick={() => setHighlightId(active ? null : pid)}
                          variant={active ? "primary" : "ghost"}
                          size="xs"
                          className="w-full justify-start font-normal"
                        >
                          {active && <span className="mr-1">●</span>}
                          {p.firstName} {p.lastName}
                        </Button>
                      );
                    })
                  : null}
                {highlightId !== null && (
                  <Button
                    type="button"
                    onClick={() => setHighlightId(null)}
                    variant="ghost"
                    size="xs"
                    className="mt-1 w-full justify-start text-slate-500"
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable rounds */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {resolvedSchedule.map((round, i) => {
              const eventStartSide = getEventStartSide(i);
              const boundaries = getScoringPeriodBoundariesBeforeEvent(
                resolvedSchedule,
                i,
                previewScoringPeriods
              );
              const eventForRow = {
                ...methods.getValues(),
                date: round.date,
                startSide: eventStartSide,
              };
              return (
                <Fragment key={i}>
                  {boundaries.map((period) => (
                    <ScoringPeriodDivider key={period.id} period={period} />
                  ))}
                  <div className="border rounded-xl bg-white shadow-xs overflow-hidden">
                    {/* Row header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-100/40">
                      <div className="flex items-center gap-3">
                        <CalendarDays size={14} className="text-slate-900/40" />
                        <span className="text-sm font-semibold">Round {i + 1}</span>
                        {selectedCourse && (
                          <>
                            <span className="text-xs text-slate-900/50">{selectedCourse.name}</span>
                            <span className="text-xs text-slate-900/30">&bull;</span>
                          </>
                        )}
                        {selectedTee && (
                          <>
                            <span className="text-xs text-slate-900/50">{selectedTee.name} Tees</span>
                            <span className="text-xs text-slate-900/30">&bull;</span>
                          </>
                        )}
                        <span className="text-xs text-slate-900/50 capitalize">{eventStartSide}</span>
                        <span className="text-xs text-slate-900/30">&bull;</span>
                        <span className="text-xs text-slate-900/50">
                          {dayjs(round.date).format("ddd, MMM D, YYYY")}
                        </span>
                      </div>
                      {/* Editable date */}
                      <DateInput
                        value={round.date}
                        min={resolvedStartDate}
                        max={resolvedEndDate}
                        onChange={(e) => updateDate(i, e.target.value)}
                        className="w-40"
                      />
                    </div>
                    {/* Draggable flights */}
                    <div className="p-3 overflow-x-auto">
                      <FlightsDragRow
                        event={eventForRow}
                        flights={round.flights}
                        players={players}
                        setFlights={(flights) => updateFlights(i, flights)}
                        allowDelete={false}
                        highlightId={highlightId}
                      />
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      {resolvedSchedule.length > 0 && (
        <div className="flex justify-end gap-2 pb-4">
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
            {mutation.isPending
              ? `Creating ${resolvedSchedule.length} events…`
              : `Create ${resolvedSchedule.length} Events`}
          </Button>
        </div>
      )}
    </div>
  );
}
