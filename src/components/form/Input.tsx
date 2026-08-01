import TextField from "@mui/material/TextField";
import { forwardRef, useId } from "react";
import { Label } from "./Label";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  dense?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = "text", label, placeholder, className, error, dense = false, ...inputProps },
  ref
) {
  const generatedId = useId();
  const controlId = inputProps.id ?? generatedId;

  return (
    <div className={className}>
      {label ? <Label htmlFor={controlId} text={label} /> : null}
      <TextField
        id={controlId}
        fullWidth
        type={type}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={error}
        inputRef={ref}
        size="small"
        slotProps={{ htmlInput: inputProps }}
        sx={{
          "& .MuiInputBase-root": { minHeight: dense ? 31 : 35, fontSize: dense ? "0.6875rem" : "0.75rem" },
          "& .MuiInputBase-input": { py: dense ? 0.65 : 0.85 },
          "& .MuiFormHelperText-root": { mx: 0.5, mt: 0.5, fontSize: "0.625rem" },
        }}
      />
    </div>
  );
});

export default Input;
