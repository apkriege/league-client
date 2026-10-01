import CourseSetupCheck from "@/features/courses/CourseSetupCheck";
import { Input, Select, SelectableInfoCard } from "@/components/form";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import SectionKicker from "@/components/layout/SectionKicker";
import { Trophy, User, Users, CalendarRange, Flag, Repeat2 } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  clampLeagueEndDate,
  getLeagueDateInputValue,
  getMaximumLeagueEndDate,
  parseLeagueDateInput,
} from "../leagueDates";
import { addCalendarYear } from "@/features/leagues/seasonDates";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <SectionKicker className="mb-3">{children}</SectionKicker>
);

type InfoFormProps = {
  competitiveSettingsLocked?: boolean;
  isEditing?: boolean;
};

export default function InfoForm({
  competitiveSettingsLocked = false,
  isEditing = false,
}: InfoFormProps) {
  const leagueForm = useFormContext();
  const startDate = leagueForm.watch("startDate");
  const isSeason = leagueForm.watch("type") === "season";
  const startDateInput = getLeagueDateInputValue(startDate);
  const maxEndDate = getMaximumLeagueEndDate(startDate);
  const isTeamSeason = isSeason && leagueForm.watch("format") === "team";

  return (
    <>
      <PageHeader
        title={isEditing ? "Edit League" : "Create Your League"}
        subTitle={
          isEditing
            ? "Update league details and settings."
            : "Check your course, then choose your league settings."
        }
      />

      {!isEditing && <CourseSetupCheck />}
      <div className="mt-6 space-y-3">
        {/* General Info */}
        <Card>
          <SectionLabel>General Information</SectionLabel>
          <div className="flex flex-col gap-3">
            <Controller
              name="name"
              control={leagueForm.control}
              render={({ field }) => (
                <Input
                  label="League Name"
                  placeholder="Enter league name"
                  {...field}
                  className="w-2/3"
                />
              )}
            />
            <Controller
              name="description"
              control={leagueForm.control}
              render={({ field }) => (
                <Input
                  label="Description"
                  placeholder="Enter league description"
                  className="w-full"
                  {...field}
                />
              )}
            />
            <div className="grid grid-cols-2 gap-x-4">
              <Controller
                name="startDate"
                control={leagueForm.control}
                render={({ field }) => (
                  <Input
                    type="date"
                    label="Start Date"
                    placeholder="YYYY-MM-DD"
                    disabled={isEditing}
                    value={getLeagueDateInputValue(field.value)}
                    onChange={(e) => {
                      const nextStartDate = parseLeagueDateInput(e.target.value);
                      field.onChange(nextStartDate);
                      leagueForm.setValue(
                        "endDate",
                        isSeason
                          ? addCalendarYear(nextStartDate)
                          : clampLeagueEndDate(nextStartDate, leagueForm.getValues("endDate")),
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={leagueForm.control}
                render={({ field }) => (
                  <Input
                    type="date"
                    label="End Date"
                    placeholder="YYYY-MM-DD"
                    disabled={isEditing || isSeason}
                    min={startDateInput}
                    max={maxEndDate}
                    value={getLeagueDateInputValue(field.value)}
                    onChange={(event) => field.onChange(parseLeagueDateInput(event.target.value))}
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {/* League Type */}
        <Card>
          <SectionLabel>League Type</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <SelectableInfoCard
              title="Season"
              description="A collection of events. Players earn points across events and compete for the season championship."
              icon={<CalendarRange size={16} className="text-slate-900" />}
              active={leagueForm.watch("type") === "season"}
              disabled={competitiveSettingsLocked}
              onClick={() => {
                leagueForm.setValue("type", "season");
                leagueForm.setValue("endDate", addCalendarYear(leagueForm.getValues("startDate")), {
                  shouldDirty: true,
                });
                if (!["individual", "team"].includes(leagueForm.watch("format"))) {
                  leagueForm.setValue("format", "team");
                }
              }}
            />
            <SelectableInfoCard
              title="Tournament"
              description="Single standalone events not tied to a season. Ideal for one-off competitions or casual play."
              icon={<Trophy size={16} className="text-slate-900" />}
              active={leagueForm.watch("type") === "tournament"}
              disabled={competitiveSettingsLocked}
              onClick={() => {
                leagueForm.setValue("type", "tournament");
                leagueForm.setValue("format", null);
                leagueForm.setValue("holeFormat", "mixed", { shouldDirty: true });
              }}
            />
          </div>
        </Card>

        {/* Season Format */}
        {leagueForm.watch("type") === "season" && (
          <Card>
            <SectionLabel>Season Format</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <SelectableInfoCard
                title="Individuals"
                description="Players compete as individuals throughout the season. No team assignment required."
                icon={<User size={16} className="text-slate-900" />}
                active={leagueForm.watch("format") === "individual"}
                disabled={competitiveSettingsLocked}
                onClick={() => leagueForm.setValue("format", "individual")}
              />
              <SelectableInfoCard
                title="Teams"
                description="Players are grouped into fixed teams for season standings and team-based play."
                icon={<Users size={16} className="text-slate-900" />}
                active={leagueForm.watch("format") === "team"}
                disabled={competitiveSettingsLocked}
                onClick={() => leagueForm.setValue("format", "team")}
              />
            </div>
          </Card>
        )}

        {isTeamSeason ? (
          <Card>
            <SectionLabel>Team Rosters & Weekly Lineups</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="teamRosterSize"
                control={leagueForm.control}
                render={({ field }) => (
                  <Select
                    label="Maximum golfers per team"
                    value={Number(field.value || 4)}
                    options={[1, 2, 3, 4].map((value) => ({ value, label: String(value) }))}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      field.onChange(next);
                      if (Number(leagueForm.getValues("teamPlayersPerEvent")) > next) {
                        leagueForm.setValue("teamPlayersPerEvent", next, { shouldDirty: true });
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="teamPlayersPerEvent"
                control={leagueForm.control}
                render={({ field }) => (
                  <Select
                    label="Default golfers playing per team"
                    value={Number(field.value || 2)}
                    options={Array.from(
                      { length: Number(leagueForm.watch("teamRosterSize") || 4) },
                      (_, index) => ({ value: index + 1, label: String(index + 1) }),
                    )}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                )}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Commissioners select the required golfers for every team event. Team members not selected remain on the roster.
            </p>
          </Card>
        ) : null}

        <Card>
          <SectionLabel>League Holes & Handicap</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            <SelectableInfoCard
              title="9 Holes"
              description="Every event is 9 holes. Player entries and ongoing calculations use a 9-hole handicap."
              icon={<Flag size={16} className="text-slate-900" />}
              active={leagueForm.watch("holeFormat") === "9"}
              disabled={competitiveSettingsLocked}
              onClick={() => leagueForm.setValue("holeFormat", "9", { shouldDirty: true })}
            />
            <SelectableInfoCard
              title="18 Holes"
              description="Every event is 18 holes. Player entries and calculations use an 18-hole handicap."
              icon={<Flag size={16} className="text-slate-900" />}
              active={leagueForm.watch("holeFormat") === "18"}
              disabled={competitiveSettingsLocked}
              onClick={() => leagueForm.setValue("holeFormat", "18", { shouldDirty: true })}
            />
            <SelectableInfoCard
              title="Mixed 9/18"
              description="Events may be 9 or 18 holes and must be added manually. Handicaps use the 18-hole value."
              icon={<Repeat2 size={16} className="text-slate-900" />}
              active={leagueForm.watch("holeFormat") === "mixed"}
              disabled={competitiveSettingsLocked}
              onClick={() => leagueForm.setValue("holeFormat", "mixed", { shouldDirty: true })}
            />
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <SectionLabel>League Contact</SectionLabel>
          <div className="grid grid-cols-2 gap-x-4">
            <Controller
              name="contactFirstName"
              control={leagueForm.control}
              render={({ field }) => (
                <Input label="First Name" placeholder="Enter contact first name" {...field} />
              )}
            />
            <Controller
              name="contactLastName"
              control={leagueForm.control}
              render={({ field }) => (
                <Input label="Last Name" placeholder="Enter contact last name" {...field} />
              )}
            />
            <Controller
              name="contactEmail"
              control={leagueForm.control}
              render={({ field }) => (
                <Input label="Email" placeholder="Enter contact email" {...field} />
              )}
            />
            <Controller
              name="contactPhone"
              control={leagueForm.control}
              render={({ field }) => (
                <Input label="Phone" placeholder="Enter contact phone" {...field} />
              )}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
