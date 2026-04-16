import { Input } from "@/components/form";
import Card from "@/components/layout/Card";
import Divider from "@/components/layout/Divider";
import dayjs from "dayjs";
import { Globe, Info, Lock, Trophy, User, Users, WholeWord } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

const AccessCard = ({
  title,
  text,
  icon,
  active,
  onClick,
}: {
  title: string;
  text: string;
  icon: any;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer border ${active ? "border-accent bg-secondary/5 border-2" : "border-base-300 hover:border-secondary/80 hover:bg-secondary/5"} transition-colors`}
    >
      <div className={`p-2 bg-secondary rounded-md w-fit text-accent mb-2`}>{icon}</div>
      <h3 className="font-bold text-sm mb-2">{title}</h3>
      <p className="text-[11px] text-gray-600">{text}</p>
    </div>
  );
};

export default function InfoForm() {
  const leagueForm = useFormContext();

  return (
    <>
      <div className="badge badge-secondary mb-2 font-semibold rounded-full text-[10px]">
        <Info size={14} />
        <span>LEAGUE WIZARD</span>
      </div>
      <h1 className="text-3xl font-extrabold mb-2">Create Your League</h1>
      <p className="text-sm text-gray-500 mb-6 w-1/2">
        Let's build the foundation of your tournament season. Complete the following sections to
        initialize your digital caddie environment.
      </p>
      <Card className="w-full">
        <h2 className="text-md font-bold mb-2">General Information</h2>
        <div className="flex flex-col gap-3 mb-4">
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
                  onChange={(e) => field.onChange(new Date(e.target.value))}
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
                  value={dayjs(field.value).format("YYYY-MM-DD")}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
          </div>
          <div className="mb-4">
            <h2 className="text-md font-bold mb-2">Access</h2>
            <div className="grid grid-cols-2 gap-4">
              <AccessCard
                title="Public League"
                text="Visible to anyone that has access to the platform. They can view the league but must be added by an admin to join."
                icon={<Globe size={18} />}
                active={leagueForm.watch("access") === "public"}
                onClick={() => leagueForm.setValue("access", "public")}
              />
              <AccessCard
                title="Private League"
                text="Only invited members who have an account can view this league and its contents."
                icon={<Lock size={18} />}
                active={leagueForm.watch("access") === "private"}
                onClick={() => leagueForm.setValue("access", "private")}
              />
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-md font-bold mb-2">League Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <AccessCard
                title="Season"
                text="A collection of events that make up a season. Players earn points based on their performance in each event and compete for the season championship."
                icon={<WholeWord size={18} />}
                active={leagueForm.watch("type") === "season"}
                onClick={() => {
                  leagueForm.setValue("type", "season");
                  if (!["individual", "team"].includes(leagueForm.watch("format"))) {
                    leagueForm.setValue("format", "team");
                  }
                }}
              />
              <AccessCard
                title="Tournament"
                text="Create single events that are not connected to a season. Ideal for one-off competitions or casual play."
                icon={<Trophy size={18} />}
                active={leagueForm.watch("type") === "tournament"}
                onClick={() => {
                  leagueForm.setValue("type", "tournament");
                  leagueForm.setValue("format", null);
                }}
              />
            </div>
          </div>
          {leagueForm.watch("type") === "season" && (
            <div className="mb-4">
              <h2 className="text-md font-bold mb-2">Season Format</h2>
              <div className="grid grid-cols-2 gap-4">
                <AccessCard
                  title="Individuals"
                  text="Players compete as individuals throughout the season. No team assignment is required."
                  icon={<User size={18} />}
                  active={leagueForm.watch("format") === "individual"}
                  onClick={() => leagueForm.setValue("format", "individual")}
                />
                <AccessCard
                  title="Teams"
                  text="Players are grouped into fixed teams for season standings and team-based play."
                  icon={<Users size={18} />}
                  active={leagueForm.watch("format") === "team"}
                  onClick={() => leagueForm.setValue("format", "team")}
                />
              </div>
            </div>
          )}
          <Divider />
          <div className="mb-4">
            <h2 className="text-md font-bold">Contact</h2>
            <div className="grid grid-cols-2 gap-x-4">
              <Controller
                name="contactFirstName"
                control={leagueForm.control}
                render={({ field }) => (
                  <Input
                    label="Contact First Name"
                    placeholder="Enter contact first name"
                    {...field}
                  />
                )}
              />
              <Controller
                name="contactLastName"
                control={leagueForm.control}
                render={({ field }) => (
                  <Input
                    label="Contact Last Name"
                    placeholder="Enter contact last name"
                    {...field}
                  />
                )}
              />
              <Controller
                name="contactEmail"
                control={leagueForm.control}
                render={({ field }) => (
                  <Input label="Contact Email" placeholder="Enter contact email" {...field} />
                )}
              />
              <Controller
                name="contactPhone"
                control={leagueForm.control}
                render={({ field }) => (
                  <Input label="Contact Phone" placeholder="Enter contact phone" {...field} />
                )}
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
