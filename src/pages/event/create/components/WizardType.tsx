import Paper from "@mui/material/Paper";
import { Check, CircleCheck, Info, Trophy } from "lucide-react";

export type EventWizardType = "single" | "multi";

const WizardCard = ({
  icon,
  title,
  description,
  pros,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  pros: string[];
  selected: boolean;
  onSelect: () => void;
}) => (
  <Paper
    component="button"
    type="button"
    variant="outlined"
    aria-pressed={selected}
    className="flex w-full cursor-pointer flex-col p-5 text-left transition-all"
    onClick={onSelect}
    sx={{
      borderWidth: 2,
      borderColor: selected ? "rgb(125 211 252)" : "rgb(226 232 240)",
      borderRadius: "1.5rem",
      backgroundColor: selected ? "rgb(240 249 255)" : "rgb(255 255 255)",
      boxShadow: "0 18px 48px rgb(16 24 40 / 0.08)",
      "&:hover": {
        borderColor: "rgb(125 211 252)",
        backgroundColor: selected ? "rgb(240 249 255)" : "rgb(248 250 252)",
      },
      "&:focus-visible": {
        outline: "3px solid rgb(14 165 233 / 0.3)",
        outlineOffset: 2,
      },
    }}
  >
    <div className="flex justify-between items-start">
      <div className="bg-slate-900 rounded-lg p-2 w-fit mb-3">{icon}</div>
      {selected && <Check size={20} strokeWidth={4} className="text-green-500 inline-block ml-2" />}
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
    <div className="flex flex-col mt-5 gap-3">
      {pros.map((pro, idx) => (
        <p key={idx} className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          <CircleCheck size={15} className="text-green-500 font-bold" />
          {pro}
        </p>
      ))}
    </div>
  </Paper>
);

export default function WizardType({
  wizardType,
  setWizardType,
  allowMulti = true,
}: {
  wizardType: EventWizardType;
  setWizardType: (type: EventWizardType) => void;
  allowMulti?: boolean;
}) {
  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <WizardCard
          icon={<Trophy size={16} className="text-sky-600" />}
          title="Single Event"
          description="Create a one-time event for a specific date and time."
          pros={["Quick setup", "Ideal for casual play", "No ongoing management"]}
          selected={wizardType === "single"}
          onSelect={() => setWizardType("single")}
        />
        {allowMulti && (
          <WizardCard
            icon={<Trophy size={18} className="text-sky-600" />}
            title="Multi-Event Series"
            description="Set up a series of events with recurring dates and times."
            pros={[
              "Manage multiple events in one place",
              "Track player performance over time",
              "Ideal for leagues or tournaments",
            ]}
            selected={wizardType === "multi"}
            onSelect={() => setWizardType("multi")}
          />
        )}
      </div>
      <div className="bg-white border-l-4 border-red-700/50 rounded-lg p-3 flex gap-3 items-start">
        <Info size={18} strokeWidth={2} className="inline-block text-red-700 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold mb-1">Caddy Tip</h4>
          <p className="text-xs text-gray-500 italic">
            {allowMulti
              ? "The multi-event series builder can automate recurring round scheduling. You can still customize individual events later."
              : "Mixed 9/18-hole leagues require each event to be added manually so its hole count can be chosen individually."}
          </p>
        </div>
      </div>
    </div>
  );
}
