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
  const gridCols = options.length > 0 ? `grid-cols-${options.length}` : "grid-cols-1";
  const widthClass = `w-1/${options.length}`;

  return (
    <div className={`bg-white/70 border border-black/5 p-1 rounded-2xl gap-2 text-gray-700 grid ${gridCols} ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={`w-full flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer ${widthClass} transition-all duration-200 ease-out ${
              isSelected ? "bg-primary text-primary-content shadow-sm" : "hover:bg-sky-100/70"
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
