import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = "text", label, placeholder, className, error, ...inputProps },
  ref
) {
  return (
    <fieldset className={`fieldset ${className || ""}`}>
      {label ? (
        <legend className="fieldset-legend p-1 uppercase text-gray-500 font-semibold text-[10px] tracking-wider">
          {label}
        </legend>
      ) : null}
      <input
        ref={ref}
        type={type}
        className={`input w-full text-xs h-[35px] rounded-md bg-base-200 border-base-300 ${
          error ? "input-error" : ""
        }`}
        placeholder={placeholder}
        {...inputProps}
      />
      {error ? <p className="text-error text-[10px] mt-1">{error}</p> : null}
    </fieldset>
  );
});

export default Input;
