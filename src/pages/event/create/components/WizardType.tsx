import Card from "@/components/layout/Card";
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
  <Card
    className={`flex flex-col cursor-pointer transition-all ${
      selected
        ? "border-secondary  bg-secondary/10"
        : "hover:border-secondary/40 hover:bg-secondary/5"
    }`}
    onClick={onSelect}
  >
    <div className="flex justify-between items-start">
      <div className="bg-primary rounded-lg p-2 w-fit mb-3">{icon}</div>
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
  </Card>
);

export default function WizardType({
  wizardType,
  setWizardType,
}: {
  wizardType: EventWizardType;
  setWizardType: (type: EventWizardType) => void;
}) {
  return (
    <div>
      <div className="flex gap-2 mb-5">
        <WizardCard
          icon={<Trophy size={16} className="text-secondary" />}
          title="Single Event"
          description="Create a one-time event for a specific date and time."
          pros={["Quick setup", "Ideal for casual play", "No ongoing management"]}
          selected={wizardType === "single"}
          onSelect={() => setWizardType("single")}
        />
        <WizardCard
          icon={<Trophy size={18} className="text-secondary" />}
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
      </div>
      <div className="bg-base-100 border-l-4 border-error/50 rounded-lg p-3 flex gap-3 items-start">
        <Info size={18} strokeWidth={2} className="inline-block text-error mt-0.5" />
        <div>
          <h4 className="text-sm font-bold mb-1">Caddy Tip</h4>
          <p className="text-xs text-gray-500 italic">
            Choosing the Full Season model enables automated round scheduling and the point
            distribution.You can still customize individual events within the season later.
          </p>
        </div>
      </div>
    </div>
  );
}
