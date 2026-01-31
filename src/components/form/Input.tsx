interface InputProps {
  type?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  type = "text",
  label,
  value,
  placeholder,
  className,
  onChange,
}: InputProps) {
  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className="fieldset-legend p-1">{label}</legend>
      <input
        type={type}
        value={value || ""}
        className={`input w-full text-xs h-[35px] rounded-md ${className}`}
        placeholder={placeholder}
        onChange={onChange}
      />
    </fieldset>
  );
}
