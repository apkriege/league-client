import { Circle, CircleCheck } from "lucide-react";

type SelectableInfoCardProps = {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  activeIndicator?: React.ReactNode;
  disabled?: boolean;
};

export default function SelectableInfoCard({
  active,
  title,
  description,
  icon,
  onClick,
  className = "",
  disabled = false,
}: SelectableInfoCardProps) {
  return (
    <button
      type="button"
      onClick={disabled && !active ? undefined : onClick}
      disabled={disabled && !active}
      className={`w-full px-3 py-2 flex items-center justify-between gap-2 rounded-lg border text-left ${
        active
          ? "bg-primary/10 border-primary cursor-pointer"
          : disabled
            ? "opacity-40 cursor-not-allowed bg-base-100 border-base-300"
            : "bg-base-100 border-base-300 hover:bg-base-200/60 cursor-pointer"
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
