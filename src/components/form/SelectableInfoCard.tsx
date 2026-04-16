import { Circle, CircleCheck } from "lucide-react";

type SelectableInfoCardProps = {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  activeIndicator?: React.ReactNode;
};

export default function SelectableInfoCard({
  active,
  title,
  description,
  icon,
  onClick,
  className = "",
}: SelectableInfoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2 flex items-center justify-between gap-2 rounded-lg border cursor-pointer text-left ${
        active ? "bg-primary/10 border-primary" : "bg-base-100 border-base-300 hover:bg-base-200/60"
      } ${className}`}
      aria-pressed={active}
    >
      <div className="flex gap-2 items-center min-w-0">
        <span className="inline-flex h-6 w-6 items-center justify-center shrink-0">{icon}</span>
        <div className="flex flex-col items-start text-left">
          <p className="text-xs font-semibold">{title}</p>
          <p className="text-[9px] text-gray-500">{description}</p>
        </div>
      </div>

      <span className="inline-flex h-6 w-6 items-center justify-center shrink-0">
        {active ? (
          <CircleCheck size={16} className="text-primary" />
        ) : (
          <Circle size={16} className="text-gray-300" />
        )}
      </span>
    </button>
  );
}
