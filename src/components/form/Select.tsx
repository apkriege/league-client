interface SelectProps {
  label?: string;
  value?: string | number;
  options: { value: any; label: string }[];
  className?: string;
  onChange: (e: any) => void;
  placeholder?: string;
}

export default function Select({
  label,
  value,
  options,
  className,
  onChange,
  placeholder,
}: SelectProps) {
  return (
    <fieldset className={`fieldset ${className} w-full`}>
      <legend className="fieldset-legend p-1">{label}</legend>
      <select
        className="select text-xs w-full h-[35px] rounded-md"
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
