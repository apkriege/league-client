import { Input, SelectableInfoCard } from "@/components/form";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import dayjs from "dayjs";
import { Globe, Info, Lock, Trophy, User, Users, CalendarRange } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="section-kicker mb-3">{children}</p>
);

export default function InfoForm() {
  const leagueForm = useFormContext();
  const startDate = leagueForm.watch("startDate");
  const maxEndDate = dayjs(startDate).add(1, "year").format("YYYY-MM-DD");

  useEffect(() => {
    if (!startDate || !dayjs(startDate).isValid()) return;
    const expectedEndDate = dayjs(startDate).add(1, "year");
    if (!dayjs(leagueForm.getValues("endDate")).isSame(expectedEndDate, "day")) {
      leagueForm.setValue("endDate", expectedEndDate.toDate(), { shouldDirty: true });
    }
  }, [leagueForm, startDate]);

  return (
    <>
      <PageHeader
        title="Create Your League"
        subTitle="Build the foundation of your tournament season. Complete the sections below to initialize your league."
        icon={<Info size={14} />}
        iconText="LEAGUE WIZARD"
      />

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
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) => {
                      const nextStartDate = dayjs(e.target.value).toDate();
                      field.onChange(nextStartDate);
                      leagueForm.setValue("endDate", dayjs(nextStartDate).add(1, "year").toDate(), {
                        shouldDirty: true,
                      });
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
                    max={maxEndDate}
                    disabled
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={() => field.onChange(dayjs(maxEndDate).toDate())}
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {/* Access */}
        <Card>
          <SectionLabel>Access</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <SelectableInfoCard
              title="Public League"
              description="Visible to anyone on the platform. Members must be added by an admin to join."
              icon={<Globe size={16} className="text-primary" />}
              active={leagueForm.watch("access") === "public"}
              onClick={() => leagueForm.setValue("access", "public")}
            />
            <SelectableInfoCard
              title="Private League"
              description="Only invited members with an account can view this league and its contents."
              icon={<Lock size={16} className="text-primary" />}
              active={leagueForm.watch("access") === "private"}
              onClick={() => leagueForm.setValue("access", "private")}
            />
          </div>
        </Card>

        {/* League Type */}
        <Card>
          <SectionLabel>League Type</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <SelectableInfoCard
              title="Season"
              description="A collection of events. Players earn points across events and compete for the season championship."
              icon={<CalendarRange size={16} className="text-primary" />}
              active={leagueForm.watch("type") === "season"}
              onClick={() => {
                leagueForm.setValue("type", "season");
                if (!["individual", "team"].includes(leagueForm.watch("format"))) {
                  leagueForm.setValue("format", "team");
                }
              }}
            />
            <SelectableInfoCard
              title="Tournament"
              description="Single standalone events not tied to a season. Ideal for one-off competitions or casual play."
              icon={<Trophy size={16} className="text-primary" />}
              active={leagueForm.watch("type") === "tournament"}
              onClick={() => {
                leagueForm.setValue("type", "tournament");
                leagueForm.setValue("format", null);
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
                icon={<User size={16} className="text-primary" />}
                active={leagueForm.watch("format") === "individual"}
                onClick={() => leagueForm.setValue("format", "individual")}
              />
              <SelectableInfoCard
                title="Teams"
                description="Players are grouped into fixed teams for season standings and team-based play."
                icon={<Users size={16} className="text-primary" />}
                active={leagueForm.watch("format") === "team"}
                onClick={() => leagueForm.setValue("format", "team")}
              />
            </div>
          </Card>
        )}

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
