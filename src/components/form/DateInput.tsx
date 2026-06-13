import { forwardRef } from "react";

interface DateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DateInput = forwardRef<HTMLInputElement, DateProps>(function Date(
  { label, className, error, ...inputProps },
  ref
) {
  return (
    <fieldset className={`fieldset ${className || ""}`}>
      {label ? (
        <legend className="fieldset-legend p-1 uppercase text-gray-500 font-black text-[10px] tracking-[0.18em]">
          {label}
        </legend>
      ) : null}
      <input
        ref={ref}
        type="date"
        className={`input w-full text-xs h-[35px] rounded-2xl bg-white/70 border-base-300 font-semibold ${
          error ? "input-error" : ""
        }`}
        {...inputProps}
      />
      {error ? <p className="text-error text-[10px] mt-1">{error}</p> : null}
    </fieldset>
  );
});

export default DateInput;
