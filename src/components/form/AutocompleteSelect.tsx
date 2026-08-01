import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useId } from "react";
import { Label } from "./Label";

export type AutocompleteOption = {
  value: string | number;
  label: string;
  content?: React.ReactNode;
};

type AutocompleteSelectProps = {
  label?: string;
  placeholder?: string;
  options: AutocompleteOption[];
  value?: string | number;
  onChange: (value: string | number | undefined, option?: AutocompleteOption) => void;
  className?: string;
  noResultsText?: string;
  disabled?: boolean;
  clearable?: boolean;
};

export default function AutocompleteSelect({
  label,
  placeholder = "Search and select...",
  options,
  value,
  onChange,
  className = "",
  noResultsText = "No results found",
  disabled = false,
  clearable = true,
}: AutocompleteSelectProps) {
  const id = useId();
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <div className={className}>
      {label ? <Label htmlFor={id} text={label} /> : null}
      <Autocomplete
        id={id}
        options={options}
        value={selectedOption}
        disabled={disabled}
        disableClearable={!clearable}
        noOptionsText={noResultsText}
        isOptionEqualToValue={(option, selected) => option.value === selected.value}
        getOptionLabel={(option) => option.label}
        onChange={(_, option) => onChange(option?.value, option ?? undefined)}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.content ?? option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} placeholder={placeholder} size="small" />
        )}
        sx={{
          "& .MuiInputBase-root": { minHeight: 35, fontSize: "0.75rem", py: 0 },
          "& .MuiAutocomplete-input": { py: "4px !important" },
        }}
      />
    </div>
  );
}
