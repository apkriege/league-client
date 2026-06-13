interface SelectProps {
  label?: string;
  value?: string | number;
  options: { value: any; label: string }[];
  className?: string;
  onChange: (e: any) => void;
  placeholder?: string;
  dense?: boolean;
}

export default function Select({
  label,
  value,
  options,
  className,
  onChange,
  placeholder,
  dense = false,
}: SelectProps) {
  return (
    <fieldset className={`fieldset ${className} w-full`}>
      <legend
        className={`fieldset-legend uppercase text-gray-500 font-black tracking-[0.18em] ${
          dense ? "px-1 py-0.5 text-[9px]" : "p-1 text-[10px]"
        }`}
      >
        {label}
      </legend>
      <select
        className={`select w-full rounded-2xl ${className || ""} bg-white/70 border-base-300 font-semibold ${
          dense ? "h-[31px] text-[11px]" : "h-[35px] text-xs"
        }`}
        value={value || ""}
        onChange={onChange}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
