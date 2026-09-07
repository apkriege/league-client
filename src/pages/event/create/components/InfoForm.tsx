import {
  AutocompleteSelect,
  DateInput,
  Input,
  Select,
  ToggleCards,
} from "@/components/form";
import { Label } from "@/components/form/Label";
import Card from "@/components/layout/Card";
import { useCoursesWithTees } from "@api/courses";
import { useLeague } from "@api/league/queries";
import { getEventDateInputValue } from "@/utils/eventDate";
import { User, Users } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Link, useParams } from "react-router";
import { useToast } from "@/context/useToast";
import {
  getFixedEventHoleCount,
  normalizeLeagueHoleFormat,
} from "@/features/leagues/leagueHoleFormat";
import { createCourseAutocompleteOptions } from "../courseAutocompleteOptions";
import ScoringModeFields from "@/features/scoring/components/ScoringModeFields";
import MuiCheckbox from "@mui/material/Checkbox";

export default function InfoForm() {
  const { leagueId } = useParams();
  const { data: courses } = useCoursesWithTees();
  const { data: league } = useLeague(Number(leagueId));
  const methods = useFormContext();
  const { show } = useToast();
  const leagueStartDate = getEventDateInputValue(league?.startDate);
  const leagueEndDate = getEventDateInputValue(league?.endDate);
  const leagueHoleFormat = normalizeLeagueHoleFormat(league?.holeFormat);
  const fixedEventHoleCount = getFixedEventHoleCount(leagueHoleFormat);
  const availableCourses = courses || [];
  const primaryCourseId = methods.watch("courseId");
  const primaryTeeId = methods.watch("teeId");
  const secondCourseId = methods.watch("secondCourseId");
  const secondTeeId = methods.watch("secondTeeId");
  const repeatFirstNine = methods.watch("repeatFirstNine") !== false;
  const selectedCourse = availableCourses.find(
    (course: any) => Number(course.id) === Number(primaryCourseId)
  );
  const selectedCourseHoleCount =
    Number(selectedCourse?.numHoles) || Number(selectedCourse?.tees?.[0]?.holes?.length);
  const isNineHoleCourse =
    Boolean(selectedCourse) && selectedCourseHoleCount > 0 && selectedCourseHoleCount <= 9;
  const canChooseEventLength =
    fixedEventHoleCount == null || (fixedEventHoleCount === 9 && isNineHoleCourse);
  const usesTwoNineRoute = isNineHoleCourse && Number(methods.watch("holes")) === 18;
  const selectedClubId = Number(selectedCourse?.clubId ?? selectedCourse?.club?.id);
  const secondNineCourses = availableCourses.filter((course: any) => {
    const holeCount = Number(course.numHoles) || Number(course.tees?.[0]?.holes?.length);
    return holeCount > 0 && holeCount <= 9 &&
      Number(course.clubId ?? course.club?.id) === selectedClubId;
  });
  const selectedSecondCourse = secondNineCourses.find(
    (course: any) => Number(course.id) === Number(secondCourseId),
  );

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

  useEffect(() => {
    if (fixedEventHoleCount === 18 || (fixedEventHoleCount === 9 && !isNineHoleCourse)) {
      methods.setValue("holes", fixedEventHoleCount, { shouldDirty: true });
    }
    if (isNineHoleCourse) {
      methods.setValue("startSide", "front", { shouldDirty: true });
    }
  }, [fixedEventHoleCount, isNineHoleCourse, methods]);

  useEffect(() => {
    if (!usesTwoNineRoute) {
      if (secondCourseId) methods.setValue("secondCourseId", "", { shouldDirty: true });
      if (secondTeeId) methods.setValue("secondTeeId", "", { shouldDirty: true });
      return;
    }
    if (repeatFirstNine) {
      if (Number(secondCourseId) !== Number(primaryCourseId)) {
        methods.setValue("secondCourseId", primaryCourseId, { shouldDirty: true });
      }
      if (Number(secondTeeId) !== Number(primaryTeeId)) {
        methods.setValue("secondTeeId", primaryTeeId || "", { shouldDirty: true });
      }
      return;
    }
    if (secondCourseId && !selectedSecondCourse) {
      methods.setValue("secondCourseId", "", { shouldDirty: true });
      methods.setValue("secondTeeId", "", { shouldDirty: true });
    }
  }, [
    methods,
    primaryCourseId,
    primaryTeeId,
    repeatFirstNine,
    secondCourseId,
    secondTeeId,
    selectedSecondCourse,
    usesTwoNineRoute,
  ]);

  if (!courses) return null;

  const courseOptions = createCourseAutocompleteOptions(availableCourses);

  const getTeeOptions = () => {
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
  const secondTeeOptions = (selectedSecondCourse?.tees || [])
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

  const isSeasonLeague = String(league?.type || "").toLowerCase() === "season";
  const lockedSeasonFormat = String(league?.format || "").toLowerCase();
  const isFormatLocked = isSeasonLeague && ["individual", "team"].includes(lockedSeasonFormat);
  const isTeamFormat = methods.watch("format") === "team";
  const clearFlightsForModeChange = () => {
    const flights = methods.getValues("flights");
    if (!Array.isArray(flights) || flights.length === 0) return;
    methods.setValue("flights", [], { shouldDirty: true });
    show("Flights were cleared because the event format changed.", "info");
  };
  const selectFormat = (nextFormat: string) => {
    if (nextFormat === methods.getValues("format")) return;
    clearFlightsForModeChange();
    methods.setValue("format", nextFormat, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="flex w-full flex-col gap-5 xl:w-2/3">
        <Card>
          <h3 className="text-lg font-bold">Event Details</h3>
          <p className="text-sm text-gray-500">
            Set up the details for your event, including date, time, and format.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Select
                label="Event Type"
                value={methods.watch("type")}
                onChange={(event) =>
                  methods.setValue("type", event.target.value, { shouldDirty: true })
                }
                options={[
                  { value: "regular", label: "Regular" },
                  { value: "playoff", label: "Playoff" },
                  { value: "championship", label: "Championship" },
                  { value: "tournament", label: "Tournament" },
                  { value: "makeup", label: "Makeup" },
                ]}
              />
            </div>
            {isFormatLocked ? (
              <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                Event format is locked to
                <span className="font-semibold ml-1 uppercase">{lockedSeasonFormat}</span>
                <span className="text-slate-900/60 ml-1">by league season settings.</span>
              </div>
            ) : (
              <ToggleCards
                value={methods.watch("format")}
                onChange={selectFormat}
                options={[
                  { value: "individual", label: "INDIVIDUAL", icon: <User /> },
                  { value: "team", label: "TEAM PLAY", icon: <Users /> },
                ]}
              />
            )}
            <div>
              <Label text="Holes" />
              {!canChooseEventLength ? (
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                  <span className="font-semibold">{fixedEventHoleCount} holes</span>
                  <span className="ml-1 text-slate-900/60">locked by league settings.</span>
                </div>
              ) : (
                <ToggleCards
                  value={String(methods.watch("holes"))}
                  onChange={(value) => methods.setValue("holes", Number(value), { shouldDirty: true })}
                  options={[
                    { value: "9", label: "9" },
                    { value: "18", label: "18" },
                  ]}
                />
              )}
            </div>
          </div>
        </Card>
        <Card>
          <div>
            <h3 className="text-lg font-bold">Course Selection</h3>
            <p className="text-sm text-gray-500">
              Set up the details for your event, including date, time, and format.
            </p>
            <AutocompleteSelect
              label={usesTwoNineRoute ? "First Nine" : "Course"}
              placeholder="Search by course, club, or location"
              options={courseOptions}
              noResultsText="No matching courses"
              denseOptions
              onChange={(value) => {
                if (Number(value) !== Number(methods.getValues("courseId"))) {
                  methods.setValue("teeId", undefined, { shouldDirty: true });
                  methods.setValue("secondCourseId", "", { shouldDirty: true });
                  methods.setValue("secondTeeId", "", { shouldDirty: true });
                }
                methods.setValue("courseId", value, { shouldDirty: true });
              }}
              value={methods.watch("courseId")}
            />
            <div className="mt-1 flex min-h-6 items-center justify-between gap-3">
              {usesTwoNineRoute ? (
                <label className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-slate-600">
                  <MuiCheckbox
                    checked={repeatFirstNine}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      methods.setValue("repeatFirstNine", checked, { shouldDirty: true });
                      methods.setValue("secondCourseId", checked ? primaryCourseId : "", { shouldDirty: true });
                      methods.setValue("secondTeeId", checked ? primaryTeeId || "" : "", { shouldDirty: true });
                    }}
                    size="small"
                    sx={{ p: 0.25 }}
                  />
                  Play the first nine twice
                </label>
              ) : <span />}
              <Link
                to="/courses"
                className="text-[10px] font-medium text-sky-700 hover:text-sky-900 hover:underline"
              >
                Can&apos;t find your course?
              </Link>
            </div>
          </div>
          {methods.watch("courseId") && (
            <div className="w-full">
              <div>
                <Label text="Tee" />
                <ToggleCards
                  value={methods.watch("teeId")}
                  onChange={(value) => {
                    const previousTeeId = methods.getValues("teeId");
                    methods.setValue("teeId", value, { shouldDirty: true });
                    if (
                      repeatFirstNine &&
                      Number(methods.getValues("secondCourseId")) ===
                        Number(methods.getValues("courseId")) &&
                      (!methods.getValues("secondTeeId") ||
                        Number(methods.getValues("secondTeeId")) === Number(previousTeeId))
                    ) {
                      methods.setValue("secondTeeId", value, { shouldDirty: true });
                    }
                  }}
                  options={getTeeOptions()}
                  className="max-grid-cols-2!"
                />
              </div>
            </div>
          )}
          {usesTwoNineRoute && !repeatFirstNine ? (
            <div className="my-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    2
                  </span>
                  <p className="text-sm font-semibold text-slate-900">Second nine</p>
                </div>
                <span className="truncate text-[10px] font-medium text-slate-500">
                  {selectedCourse?.club?.name || "Same club"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <AutocompleteSelect
                  label="Course"
                  placeholder="Choose the second nine"
                  options={createCourseAutocompleteOptions(secondNineCourses)}
                  noResultsText="No other nine-hole courses at this club"
                  denseOptions
                  value={methods.watch("secondCourseId")}
                  onChange={(value) => {
                    if (Number(value) !== Number(methods.getValues("secondCourseId"))) {
                      methods.setValue("secondTeeId", "", { shouldDirty: true });
                    }
                    methods.setValue("secondCourseId", value, { shouldDirty: true });
                  }}
                />
                {secondCourseId ? (
                  <div>
                    <Label text="Tee" />
                    <ToggleCards
                      value={methods.watch("secondTeeId")}
                      onChange={(value) => methods.setValue("secondTeeId", value, { shouldDirty: true })}
                      options={secondTeeOptions}
                      className="max-grid-cols-2!"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="w-full">
            <Label text="Starting Side" />
            <ToggleCards
              value={methods.watch("startSide")}
              onChange={(value) => methods.setValue("startSide", value)}
              options={[
                { value: "front", label: "FRONT" },
                ...(!isNineHoleCourse ? [{ value: "back", label: "BACK" }] : []),
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Interval (minutes)"
              type="number"
              min={1}
              max={180}
              step={1}
              {...methods.register("interval", {
                required: "Interval is required",
                valueAsNumber: true,
                min: { value: 1, message: "Interval must be at least 1 minute" },
                max: { value: 180, message: "Interval cannot exceed 180 minutes" },
              })}
            />
            <Input
              label="Start Time"
              type="time"
              {...methods.register("startTime", { required: "Start time is required" })}
            />
          </div>
          {isNineHoleCourse && Number(methods.watch("holes")) === 18 ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {repeatFirstNine
                ? "The first nine repeats and is scored again as holes 10–18."
                : "The selected second nine is scored as holes 10–18."}
            </div>
          ) : null}
        </Card>
      </div>
      <div className="flex w-full flex-col gap-5 xl:w-1/3">
        <Card>
          <h3 className="text-lg font-bold">Scoring</h3>
          <p className="text-sm text-gray-500">Pick the format, then configure only what it needs.</p>
          <ScoringModeFields
            format={isTeamFormat ? "team" : "individual"}
            onModeChange={clearFlightsForModeChange}
          />
        </Card>
      </div>
    </div>
  );
}
