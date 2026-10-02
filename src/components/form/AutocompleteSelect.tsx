import Autocomplete from "@mui/material/Autocomplete";
import { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useId } from "react";
import { Label } from "./Label";

export type AutocompleteOption = {
  value: string | number;
  label: string;
  searchText?: string;
  content?: React.ReactNode;
};

const filterOptions = createFilterOptions<AutocompleteOption>({
  stringify: (option) => `${option.label} ${option.searchText ?? ""}`,
  trim: true,
});

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
  denseOptions?: boolean;
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
  denseOptions = false,
}: AutocompleteSelectProps) {
  const id = useId();
  const selectedOption =
    options.find((option) => String(option.value) === String(value ?? "")) ?? null;

  return (
    <div className={className}>
      {label ? <Label htmlFor={id} text={label} /> : null}
      <Autocomplete
        id={id}
        options={options}
        value={selectedOption}
        filterOptions={filterOptions}
        openOnFocus
        autoHighlight
        disabled={disabled}
        disableClearable={!clearable}
        slotProps={
          denseOptions
            ? {
                listbox: {
                  sx: {
                    py: 0.5,
                    "& .MuiAutocomplete-option": {
                      minHeight: 32,
                      px: 1,
                      py: 0.5,
                      fontSize: "0.6875rem",
                    },
                  },
                },
              }
            : undefined
        }
        noOptionsText={noResultsText}
        isOptionEqualToValue={(option, selected) =>
          String(option.value) === String(selected.value)
        }
        getOptionLabel={(option) => option.label}
        onChange={(_, option) => onChange(option?.value, option ?? undefined)}
        renderOption={(optionProps, option) => {
          const { key, ...props } = optionProps;

          return (
            <li {...props} key={key}>
              {option.content ?? option.label}
            </li>
          );
        }}
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
