type ToggleOption = {
  value: string;
  label?: string;
  icon?: React.ReactNode;
  body?: React.ReactNode;
};

type ToggleCardsProps = {
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
  className?: string;
  optionClassName?: string;
};

export default function ToggleCards({
  value,
  onChange,
  options,
  className = "",
  optionClassName = "",
}: ToggleCardsProps) {
  return (
    <div
      className={`grid gap-2 rounded-2xl border border-black/5 bg-white/70 p-1 text-gray-700 ${className}`}
      style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border p-2 transition-all duration-200 ease-out ${
              isSelected
                ? "border-sky-300 bg-sky-100/80 text-slate-950 shadow-sm ring-1 ring-sky-200/70"
                : "border-transparent hover:bg-slate-50"
            } ${optionClassName}`}
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
          >
            {option.icon}
            <span className="text-[10px] font-bold mt-1">{option.label ?? option.body}</span>
          </button>
        );
      })}
    </div>
  );
}
