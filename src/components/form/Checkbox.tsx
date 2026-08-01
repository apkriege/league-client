import FormControlLabel from "@mui/material/FormControlLabel";
import MuiCheckbox from "@mui/material/Checkbox";

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
  const control = (
    <MuiCheckbox
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      disabled={disabled}
      size="small"
    />
  );

  return label ? (
    <FormControlLabel className={className} control={control} label={label} />
  ) : (
    <span className={className}>{control}</span>
  );
}
