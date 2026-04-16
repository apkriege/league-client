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
      <legend className="fieldset-legend p-1 uppercase text-gray-500 font-semibold text-[10px] tracking-wider">
        {label}
      </legend>
      <select
        className={`select w-full text-xs h-[35px] rounded-md ${className} bg-base-200 border-base-300`}
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
