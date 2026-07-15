import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  dense?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = "text", label, placeholder, className, error, dense = false, ...inputProps },
  ref
) {
  return (
    <fieldset className={`fieldset ${className || ""}`}>
      {label ? (
        <legend
          className={`fieldset-legend field-label ${
            dense ? "px-1 py-0.5 text-[9px]" : "p-1 text-[10px]"
          }`}
        >
          {label}
        </legend>
      ) : null}
      <input
        ref={ref}
        type={type}
        className={`input form-input ${
          dense ? "h-[31px] text-[11px]" : "h-[35px] text-xs"
        } ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        {...inputProps}
      />
      {error ? <p className="text-error text-[10px] mt-1">{error}</p> : null}
    </fieldset>
  );
});

export default Input;
