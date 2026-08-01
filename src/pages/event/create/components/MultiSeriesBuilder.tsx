import Button from "@/components/layout/Button";
import { useState, useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import {
  CalendarDays,
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
import { useToast } from "@/context/ToastContext";
import { getEventDateInputValue } from "@/utils/eventDate";
import { DEFAULT_STROKE_POINTS } from "../constants";
import {
  buildDates,
  buildFlights,
  generateRoundRobin,
  shuffleArray,
  type ScheduleRound,
} from "../multiSeriesSchedule";
import MuiCheckbox from "@mui/material/Checkbox";

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

  const clampToLeagueDates = useCallback(
    (date: string) => {
      if (leagueStartDate && date < leagueStartDate) return leagueStartDate;
      if (leagueEndDate && date > leagueEndDate) return leagueEndDate;
      return date;
    },
    [leagueStartDate, leagueEndDate]
  );

  useEffect(() => {
    if (!leagueStartDate || !leagueEndDate) return;

    setStartDate((currentStart) => {
      const nextStart = clampToLeagueDates(currentStart);
      setEndDate((currentEnd) => {
        const nextEnd = clampToLeagueDates(currentEnd);
        return nextEnd < nextStart ? nextStart : nextEnd;
      });
      return nextStart;
    });
    setSchedule((current) =>
      current.map((round) => ({
        ...round,
        date: clampToLeagueDates(round.date),
      }))
    );
  }, [leagueStartDate, leagueEndDate, clampToLeagueDates]);

  const sharedStartSide = methods.watch("startSide") === "back" ? "back" : "front";
  const getEventStartSide = (index: number) => {
    if (!alternateStartSides) return sharedStartSide;
    return index % 2 === 0 ? sharedStartSide : sharedStartSide === "front" ? "back" : "front";
  };

  const generatedDates = buildDates(startDate, endDate, selectedDays, frequency);
  const eventCount = generatedDates.length;

  const mutation = useCreateLeagueEvents(() => {
    show(`${schedule.length} events created!`, "success");
    navigate(`/league/${leagueId}/admin`);
  });

  // Course / tee options
  const courseOptions = (courses || []).map((c: any) => ({
    value: c.id,
    label: c.name,
    content: (
      <div className="flex flex-col">
        <span>
          {c.name}, {c.location}
        </span>
        <span className="text-[10px] text-gray-500">
          {c.par} &bull; {c.numHoles} HOLES
        </span>
      </div>
    ),
  }));

  const selectedCourse = (courses || []).find((c: any) => c.id === methods.watch("courseId"));
  const selectedTee = (selectedCourse?.tees || []).find(
    (t: any) => t.id === methods.watch("teeId")
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

  const handleGenerate = useCallback(
    (doShuffle = false) => {
      if (ids.length < 2) {
        show(
          `Add at least 2 ${format === "team" ? "teams" : "players"} before generating.`,
          "error"
        );
        return;
      }
      const sourceIds = doShuffle ? shuffleArray(ids) : ids;
      const rrData = generateRoundRobin(sourceIds);
      const dates = buildDates(startDate, endDate, selectedDays, frequency);
      if (!dates.length) {
        show("Select at least one day of the week within the date range.", "error");
        return;
      }

      setSchedule(
        dates.map((date, i) => ({
          date,
          flights: buildFlights(rrData[i % rrData.length] ?? [], format, scoringFormat),
        }))
      );
    },
    [ids, startDate, endDate, selectedDays, frequency, format, scoringFormat]
  );

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
    if (!schedule.length) {
      show("Generate a schedule first.", "error");
      return;
    }
    const outsideLeagueDate = schedule.find(
      (round) =>
        (leagueStartDate && round.date < leagueStartDate) ||
        (leagueEndDate && round.date > leagueEndDate)
    );
    if (outsideLeagueDate) {
      show("Event dates must stay within the league start and end dates.", "error");
      return;
    }
    const shared = methods.getValues();
    mutation.mutate({
      leagueId: Number(leagueId),
      events: schedule.map((r, i) => ({
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
    });
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
                placeholder="Select a course"
                options={courseOptions}
                onChange={(v) => methods.setValue("courseId", v)}
                value={methods.watch("courseId")}
              />

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
                    { value: "back", label: "BACK" },
                  ]}
                />
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
                  <ToggleCards
                    value={String(methods.watch("holes"))}
                    onChange={(v) => methods.setValue("holes", Number(v))}
                    options={[
                      { value: "9", label: "9" },
                      { value: "18", label: "18" },
                    ]}
                  />
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
            value={startDate}
            min={leagueStartDate || undefined}
            max={leagueEndDate || undefined}
            onChange={(e) => {
              const nextStartDate = clampToLeagueDates(e.target.value);
              setStartDate(nextStartDate);
              if (dayjs(endDate).isBefore(dayjs(nextStartDate), "day")) {
                setEndDate(nextStartDate);
              }
            }}
          />
          <DateInput
            label="End Date"
            value={endDate}
            min={leagueStartDate && leagueStartDate > startDate ? leagueStartDate : startDate}
            max={leagueEndDate || undefined}
            onChange={(e) => setEndDate(clampToLeagueDates(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-3">
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
          <Button
            type="button"
            variant="primary"
            onClick={() => handleGenerate(false)}
          >
            <RefreshCw size={12} />
            Generate Schedule
          </Button>
          {schedule.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleGenerate(true)}
            >
              <Shuffle size={12} />
              Shuffle Matchups
            </Button>
          )}
        </div>
      </Card>

      {/* ── Schedule rounds ── */}
      {schedule.length > 0 && (
        <div className="flex gap-4 items-start">
          {/* Sticky highlight selector */}
          <div className="sticky top-4 w-48 shrink-0">
            <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
              <div className="px-3 py-2.5 border-b bg-slate-100/40">
                <p className="text-[10px] font-semibold tracking-wide text-slate-900/50">
                  {format === "team" ? "Filter by Team" : "Filter by Player"}
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
            {schedule.map((round, i) => {
              const eventStartSide = getEventStartSide(i);
              const eventForRow = {
                ...methods.getValues(),
                date: round.date,
                startSide: eventStartSide,
              };
              return (
                <div key={i} className="border rounded-xl bg-white shadow-xs overflow-hidden">
                  {/* Row header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-100/40">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={14} className="text-slate-900/40" />
                      <span className="text-sm font-semibold">Round {i + 1}</span>
                      {selectedCourse && (
                        <>
                          <span className="text-xs text-slate-900/50">
                            {selectedCourse.name}
                          </span>
                          <span className="text-xs text-slate-900/30">&bull;</span>
                        </>
                      )}
                      {selectedTee && (
                        <>
                          <span className="text-xs text-slate-900/50">
                            {selectedTee.name} Tees
                          </span>
                          <span className="text-xs text-slate-900/30">&bull;</span>
                        </>
                      )}
                      <span className="text-xs text-slate-900/50 capitalize">
                        {eventStartSide}
                      </span>
                      <span className="text-xs text-slate-900/30">&bull;</span>
                      <span className="text-xs text-slate-900/50">
                        {dayjs(round.date).format("ddd, MMM D, YYYY")}
                      </span>
                    </div>
                    {/* Editable date */}
                    <DateInput
                      value={round.date}
                      min={leagueStartDate || undefined}
                      max={leagueEndDate || undefined}
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
              );
            })}
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      {schedule.length > 0 && (
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
              ? `Creating ${schedule.length} events…`
              : `Create ${schedule.length} Events`}
          </Button>
        </div>
      )}
    </div>
  );
}
