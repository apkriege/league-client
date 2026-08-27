import TextField from "@mui/material/TextField";
import { forwardRef, useId } from "react";
import { Label } from "./Label";

interface DateProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
}

const DateInput = forwardRef<HTMLInputElement, DateProps>(function DateInput(
  { label, className, error, ...inputProps },
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
        type="date"
        error={Boolean(error)}
        helperText={error}
        inputRef={ref}
        size="small"
        slotProps={{ htmlInput: inputProps }}
        sx={{
          "& .MuiInputBase-root": { minHeight: 35, fontSize: "0.75rem" },
          "& .MuiInputBase-input": { py: 0.85 },
          "& .MuiFormHelperText-root": { mx: 0.5, mt: 0.5, fontSize: "0.625rem" },
        }}
      />
    </div>
  );
});

export default DateInput;
