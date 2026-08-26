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
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full px-3 py-2 flex items-center justify-between gap-2 rounded-2xl border text-left transition-all ${
        active && !disabled
          ? "bg-sky-100/70 border-sky-300 cursor-pointer shadow-xs"
          : active
            ? "bg-sky-100/70 border-sky-300 cursor-not-allowed shadow-xs opacity-70"
            : disabled
            ? "opacity-40 cursor-not-allowed bg-white border-slate-200"
            : "bg-white/70 border-slate-200 hover:bg-white cursor-pointer hover:shadow-sm"
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
          <CircleCheck size={16} className="text-sky-700" />
        ) : (
          <Circle size={16} className="text-gray-300" />
        )}
      </span>
    </button>
  );
}
