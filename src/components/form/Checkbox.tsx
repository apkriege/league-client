interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className="fieldset-legend p-1">{label}</legend>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`checkbox checkbox-primary ${className} h-5 w-5 rounded-md`}
      />
    </fieldset>
  );
}
