export default function RadioCards({
  label,
  options,
  name,
  value,
  onChange,
  className = "",
}: {
  label: string;
  options: { label: string; value: string }[];
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`fieldset ${className}`}>
      {label ? (
        <legend className="fieldset-legend p-1 uppercase text-gray-500 font-semibold text-[10px] tracking-wider">
          {label}
        </legend>
      ) : null}
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`card cursor-pointer border ${
              value === option.value ? "border-primary" : "border-base-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="hidden"
            />
            <div className="card-body p-2">
              <p className="text  sm">{option.label}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
