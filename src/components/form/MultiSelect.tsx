import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useId } from "react";
import { Label } from "./Label";

interface MultiSelectOption {
  value: string | number;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value?: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  className?: string;
}

export default function MultiSelect({
  label,
  placeholder = "Select options...",
  options,
  value = [],
  onChange,
  className = "",
}: MultiSelectProps) {
  const id = useId();
  const selectedOptions = options.filter((option) => value.includes(option.value));

  return (
    <div className={className}>
      {label ? <Label htmlFor={id} text={label} /> : null}
      <Autocomplete
        multiple
        id={id}
        options={options}
        value={selectedOptions}
        isOptionEqualToValue={(option, selected) => option.value === selected.value}
        getOptionLabel={(option) => option.label}
        onChange={(_, selected) => onChange(selected.map((option) => option.value))}
        renderValue={(selected, getItemProps) =>
          selected.map((option, index) => {
            const { key, ...itemProps } = getItemProps({ index });
            return <Chip key={key} label={option.label} size="small" {...itemProps} />;
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedOptions.length ? undefined : placeholder}
            size="small"
          />
        )}
        sx={{
          "& .MuiInputBase-root": { minHeight: 35, fontSize: "0.75rem" },
          "& .MuiChip-root": { height: 24, fontSize: "0.6875rem" },
        }}
      />
    </div>
  );
}
