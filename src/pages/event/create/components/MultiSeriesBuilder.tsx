import { useState, useCallback } from "react";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScheduleRound = { date: string; flights: any[] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Berger circle round-robin.
 * Returns an array of rounds – each round is a flat array of paired ids:
 *   [idA, idB, idC, idD]  →  matchup(A vs B), matchup(C vs D)
 */
function generateRoundRobin(ids: number[]): number[][] {
  if (ids.length < 2) return [];
  // Pad to even with a BYE placeholder (-1)
  const arr = ids.length % 2 === 0 ? [...ids] : [...ids, -1];
  const n = arr.length;
  const fixed = arr[0];
  const rotating = arr.slice(1);
  const rounds: number[][] = [];

  for (let round = 0; round < n - 1; round++) {
    const row = [fixed, ...rotating];
    const pairs: number[] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = row[i];
      const b = row[n - 1 - i];
      if (a !== -1 && b !== -1) pairs.push(a, b);
    }
    if (pairs.length) rounds.push(pairs);
    // Rotate: move tail of rotating array to front
    rotating.unshift(rotating.pop()!);
  }

  return rounds;
}

/**
 * Convert a flat pair array into the flight format used by the app.
 *   Team match:       flight = [teamId1, teamId2]
 *   Individual match: flight = [[p1, p2]]
 *   Stroke:           flight = [p1, p2, p3, p4]
 */
function buildFlights(pairs: number[], format: string, scoringFormat: string): any[] {
  const flights: any[] = [];
  if (format === "team") {
    for (let i = 0; i < pairs.length; i += 2) {
      flights.push([pairs[i], pairs[i + 1]]);
    }
  } else if (scoringFormat === "match") {
    for (let i = 0; i < pairs.length; i += 2) {
      flights.push([[pairs[i], pairs[i + 1]]]);
    }
  } else {
    // Stroke play – group into flights of 4
    for (let i = 0; i < pairs.length; i += 4) {
      flights.push(pairs.slice(i, Math.min(i + 4, pairs.length)));
    }
  }
  return flights;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDates(startDate: string, count: number, frequency: "weekly" | "biweekly"): string[] {
  const gap = frequency === "weekly" ? 7 : 14;
  return Array.from({ length: count }, (_, i) =>
    dayjs(startDate)
      .add(i * gap, "day")
      .format("YYYY-MM-DD")
  );
}

function buildCustomDates(startDate: string, endDate: string, days: number[]): string[] {
  if (!days.length) return [];
  const dates: string[] = [];
  let cur = dayjs(startDate);
  const end = dayjs(endDate);
  while (!cur.isAfter(end)) {
    if (days.includes(cur.day())) dates.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, "day");
  }
  return dates;
}

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

  // Shared settings from the parent form context
  const format: string = methods.watch("format") || "team";
  const scoringFormat: string = methods.watch("scoringFormat") || "match";
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
  const [seriesName, setSeriesName] = useState("Weekly Series");
  const [startDate, setStartDate] = useState(dayjs().add(7, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(
    dayjs()
      .add(7 + 7 * 7, "day")
      .format("YYYY-MM-DD")
  );
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "custom">("weekly");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [schedule, setSchedule] = useState<ScheduleRound[]>([]);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const gapDays = frequency === "weekly" ? 7 : 14;
  const derivedRounds = Math.max(
    1,
    Math.floor(dayjs(endDate).diff(dayjs(startDate), "day") / gapDays) + 1
  );
  const eventCount =
    frequency === "custom"
      ? buildCustomDates(startDate, endDate, customDays).length
      : derivedRounds;

  const mutation = useCreateLeagueEvents(() => {
    show(`${schedule.length} events created!`, "success");
    navigate(`/league/${leagueId}/events`);
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
  const teeOptions = (selectedCourse?.tees || []).map((t: any) => ({
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
      const dates =
        frequency === "custom"
          ? buildCustomDates(startDate, endDate, customDays)
          : buildDates(startDate, derivedRounds, frequency);
      if (!dates.length) {
        show(
          frequency === "custom" ? "Select at least one day of the week." : "No dates in range.",
          "error"
        );
        return;
      }

      setSchedule(
        dates.map((date, i) => ({
          date,
          flights: buildFlights(rrData[i % rrData.length] ?? [], format, scoringFormat),
        }))
      );
    },
    [ids, derivedRounds, rrRounds, startDate, endDate, frequency, customDays, format, scoringFormat]
  );

  const updateDate = (i: number, date: string) =>
    setSchedule((prev) => prev.map((r, idx) => (idx === i ? { ...r, date } : r)));

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
        startSide: shared.startSide,
        holes: shared.holes,
        format: shared.format,
        scoringFormat: shared.scoringFormat,
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
            <p className="text-xs text-base-content/60 mb-4">
              These settings apply to every event in the series.
            </p>

            <div className="flex flex-col gap-4">
              {isFormatLocked ? (
                <div className="rounded-lg border border-base-300 px-3 py-2 text-xs">
                  Format locked to{" "}
                  <span className="font-semibold uppercase ml-1">{lockedSeasonFormat}</span>
                  <span className="text-base-content/60 ml-1">by league settings.</span>
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
                    onClick={() => methods.setValue("scoringFormat", "stroke")}
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
                    onClick={() => methods.setValue("scoringFormat", "match")}
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
                  <Input
                    label="Stroke Points (CSV)"
                    placeholder="e.g. 10,8,6,4,2"
                    {...methods.register("strokePoints")}
                  />
                  <p className="text-[11px] text-base-content/60 mt-1">
                    Optional. Leave blank to use Stableford scoring.
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

      {/* ── Schedule Builder ── */}
      <Card>
        <h3 className="text-base font-semibold mb-1">Schedule Builder</h3>
        <p className="text-xs text-base-content/60 mb-4">
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
            onChange={(e) => setStartDate(e.target.value)}
          />
          <DateInput
            label="End Date"
            value={endDate}
            min={dayjs(startDate).add(gapDays, "day").format("YYYY-MM-DD")}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="">
            <Label text="Frequency" />
            <ToggleCards
              value={frequency}
              onChange={(v) => setFrequency(v as "weekly" | "biweekly" | "custom")}
              options={[
                { value: "weekly", label: "WEEKLY" },
                { value: "biweekly", label: "BI-WEEKLY" },
                { value: "custom", label: "CUSTOM" },
              ]}
            />
          </div>
          {frequency === "custom" && (
            <div>
              <Label text="Days of Week" />
              <div className="flex flex-wrap gap-1.5">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    className={`btn btn-sm ${
                      customDays.includes(i) ? "btn-primary" : " border border-base-300"
                    }`}
                    onClick={() =>
                      setCustomDays((prev) =>
                        prev.includes(i)
                          ? prev.filter((d) => d !== i)
                          : [...prev, i].sort((a, b) => a - b)
                      )
                    }
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {rrRounds > 0 && (frequency !== "custom" || customDays.length > 0) && (
          <p className="text-xs text-base-content/50 mb-2 mt-2">
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
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleGenerate(false)}
          >
            <RefreshCw size={12} />
            Generate Schedule
          </button>
          {schedule.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleGenerate(true)}
            >
              <Shuffle size={12} />
              Shuffle Matchups
            </button>
          )}
        </div>
      </Card>

      {/* ── Schedule rounds ── */}
      {schedule.length > 0 && (
        <div className="flex gap-4 items-start">
          {/* Sticky highlight selector */}
          <div className="sticky top-4 w-48 shrink-0">
            <div className="bg-base-100 border rounded-xl shadow-xs overflow-hidden">
              <div className="px-3 py-2.5 border-b bg-base-200/40">
                <p className="text-[10px] font-semibold tracking-wide text-base-content/50">
                  {format === "team" ? "Filter by Team" : "Filter by Player"}
                </p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {format === "team" && teams.length > 0
                  ? teams.map((t: any) => {
                      const tid = Number(t.id);
                      const active = highlightId === tid;
                      return (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => setHighlightId(active ? null : tid)}
                          className={`btn btn-xs w-full justify-start font-normal transition-300  ${
                            active
                              ? "btn-primary"
                              : "bg-base-200 hover:bg-primary hover:text-primary-content border text-base-content"
                          }`}
                        >
                          {active && <span className="mr-1">●</span>}
                          {t.name}
                        </button>
                      );
                    })
                  : null}
                {format === "individual" && players.length > 0
                  ? players.map((p: any) => {
                      const pid = Number(p.id);
                      const active = highlightId === pid;
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setHighlightId(active ? null : pid)}
                          className={`btn btn-xs w-full justify-start font-normal ${
                            active
                              ? "btn-primary"
                              : "bg-transparent hover:bg-base-200 border-transparent text-base-content"
                          }`}
                        >
                          {active && <span className="mr-1">●</span>}
                          {p.firstName} {p.lastName}
                        </button>
                      );
                    })
                  : null}
                {highlightId !== null && (
                  <button
                    type="button"
                    onClick={() => setHighlightId(null)}
                    className="btn btn-xs w-full justify-start bg-transparent border-transparent hover:bg-base-200 text-base-content/40 mt-1"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable rounds */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {schedule.map((round, i) => {
              const eventForRow = { ...methods.getValues(), date: round.date };
              return (
                <div key={i} className="border rounded-xl bg-base-100 shadow-xs overflow-hidden">
                  {/* Row header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b bg-base-200/40">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={14} className="text-base-content/40" />
                      <span className="text-sm font-semibold">Round {i + 1}</span>
                      {selectedCourse && (
                        <>
                          <span className="text-xs text-base-content/50">
                            {selectedCourse.name}
                          </span>
                          <span className="text-xs text-base-content/30">&bull;</span>
                        </>
                      )}
                      {selectedTee && (
                        <>
                          <span className="text-xs text-base-content/50">
                            {selectedTee.name} Tees
                          </span>
                          <span className="text-xs text-base-content/30">&bull;</span>
                        </>
                      )}
                      <span className="text-xs text-base-content/50">
                        {dayjs(round.date).format("ddd, MMM D, YYYY")}
                      </span>
                    </div>
                    {/* Editable date */}
                    <DateInput
                      value={round.date}
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
            {mutation.isPending
              ? `Creating ${schedule.length} events…`
              : `Create ${schedule.length} Events`}
          </button>
        </div>
      )}
    </div>
  );
}
