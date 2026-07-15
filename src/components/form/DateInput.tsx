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
        <legend className="fieldset-legend field-label p-1 text-[10px]">
          {label}
        </legend>
      ) : null}
      <input
        ref={ref}
        type="date"
        className={`input form-input h-[35px] text-xs ${
          error ? "input-error" : ""
        }`}
        {...inputProps}
      />
      {error ? <p className="text-error text-[10px] mt-1">{error}</p> : null}
    </fieldset>
  );
});

export default DateInput;
