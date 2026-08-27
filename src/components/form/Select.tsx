import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import { useId } from "react";
import { Label } from "./Label";

interface SelectProps {
  label?: string;
  value?: string | number;
  options: { value: any; label: string }[];
  className?: string;
  onChange: (event: any) => void;
  placeholder?: string;
  dense?: boolean;
  ariaLabel?: string;
}

export default function Select({
  label,
  value,
  options,
  className,
  onChange,
  placeholder,
  dense = false,
  ariaLabel,
}: SelectProps) {
  const id = useId();

  return (
    <FormControl fullWidth size="small" className={className}>
      {label ? <Label htmlFor={id} text={label} /> : null}
      <MuiSelect
        id={id}
        value={value ?? ""}
        onChange={onChange}
        displayEmpty={Boolean(placeholder)}
        inputProps={ariaLabel ? { "aria-label": ariaLabel } : undefined}
        sx={{ minHeight: dense ? 31 : 35, fontSize: dense ? "0.6875rem" : "0.75rem" }}
      >
        {placeholder ? (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        ) : null}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ fontSize: "0.75rem" }}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
