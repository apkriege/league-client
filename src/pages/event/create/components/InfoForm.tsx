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
  const availableCourses = (courses || []).filter(
    (course: any) => fixedEventHoleCount !== 18 || Number(course.numHoles) >= 18
  );
  const selectedCourse = availableCourses.find(
    (course: any) => Number(course.id) === Number(methods.watch("courseId"))
  );
  const isNineHoleCourse = Number(selectedCourse?.numHoles) <= 9;

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
    if (fixedEventHoleCount) {
      methods.setValue("holes", fixedEventHoleCount, { shouldDirty: true });
    } else if (isNineHoleCourse) {
      methods.setValue("holes", 9, { shouldDirty: true });
    }
    if (isNineHoleCourse) {
      methods.setValue("startSide", "front", { shouldDirty: true });
    }
  }, [fixedEventHoleCount, isNineHoleCourse, methods]);

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
              placeholder="Search by course, club, or location"
              options={courseOptions}
              noResultsText="No matching courses"
              denseOptions
              onChange={(value) => {
                if (Number(value) !== Number(methods.getValues("courseId"))) {
                  methods.setValue("teeId", undefined, { shouldDirty: true });
                }
                methods.setValue("courseId", value, { shouldDirty: true });
              }}
              value={methods.watch("courseId")}
            />
            <Link
              to="/courses"
              className="mt-1 block text-right text-[10px] font-medium text-sky-700 hover:text-sky-900 hover:underline"
            >
              Can&apos;t find your course?
            </Link>
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
                ...(!isNineHoleCourse ? [{ value: "back", label: "BACK" }] : []),
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
              {fixedEventHoleCount ? (
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                  <span className="font-semibold">{fixedEventHoleCount} holes</span>
                  <span className="ml-1 text-slate-900/60">locked by league settings.</span>
                </div>
              ) : (
                <ToggleCards
                  value={String(methods.watch("holes"))}
                  onChange={(value) => methods.setValue("holes", Number(value))}
                  options={[
                    { value: "9", label: "9" },
                    ...(!isNineHoleCourse ? [{ value: "18", label: "18" }] : []),
                  ]}
                />
              )}
            </div>
          </div>
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
