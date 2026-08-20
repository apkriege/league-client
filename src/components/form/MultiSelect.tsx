import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useId } from "react";

import { Label } from "./Label";

type MultiSelectValue = string | number;

interface MultiSelectOption {
  value: MultiSelectValue;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value?: MultiSelectValue[];
  onChange: (values: MultiSelectValue[]) => void;
  className?: string;
  variant?: "autocomplete" | "dropdown";
}

type MultiSelectControlProps = Required<
  Pick<MultiSelectProps, "options" | "value" | "onChange" | "placeholder">
> & {
  id: string;
  label?: string;
};

const getSelectedOptions = (options: MultiSelectOption[], value: MultiSelectValue[]) =>
  options.filter((option) => value.includes(option.value));

const getSelectionSummary = (options: MultiSelectOption[]) => {
  const visibleLabels = options.slice(0, 2).map((option) => option.label);
  const remainingCount = options.length - visibleLabels.length;

  return remainingCount > 0
    ? `${visibleLabels.join(", ")} +${remainingCount} more`
    : visibleLabels.join(", ");
};

function DropdownMultiSelect({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
}: MultiSelectControlProps) {
  const selectedOptions = getSelectedOptions(options, value);

  return (
    <FormControl fullWidth size="small">
      <MuiSelect<MultiSelectValue[]>
        id={id}
        multiple
        displayEmpty
        value={value}
        onChange={(event) => {
          const rawValue = event.target.value;
          const nextValues = typeof rawValue === "string" ? rawValue.split(",") : rawValue;
          const normalizedValues = options
            .filter((option) =>
              nextValues.some((selectedValue) => String(selectedValue) === String(option.value))
            )
            .map((option) => option.value);

          onChange(normalizedValues);
        }}
        renderValue={() =>
          selectedOptions.length === 0 ? (
            <span className="text-[11px] text-slate-400">{placeholder}</span>
          ) : (
            <span
              className="block min-w-0 truncate text-[11px] text-slate-800"
              title={selectedOptions.map((option) => option.label).join(", ")}
            >
              {getSelectionSummary(selectedOptions)}
            </span>
          )
        }
        inputProps={{ "aria-label": label ?? placeholder }}
        MenuProps={{
          slotProps: {
            list: { dense: true },
            paper: { sx: { maxHeight: 300 } },
          },
        }}
        sx={{
          minHeight: 35,
          fontSize: "0.6875rem",
          "& .MuiSelect-select": {
            display: "block",
            minWidth: 0,
            py: 0.85,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{ minHeight: 30, py: 0.25, px: 1, fontSize: "0.6875rem" }}
          >
            <Checkbox
              checked={value.includes(option.value)}
              size="small"
              sx={{ mr: 0.75, p: 0.25, "& .MuiSvgIcon-root": { fontSize: 16 } }}
            />
            <span className="truncate">{option.label}</span>
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}

function AutocompleteMultiSelect({
  id,
  placeholder,
  options,
  value,
  onChange,
}: MultiSelectControlProps) {
  const selectedOptions = getSelectedOptions(options, value);

  return (
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
  );
}

export default function MultiSelect({
  label,
  placeholder = "Select options...",
  options,
  value = [],
  onChange,
  className = "",
  variant = "autocomplete",
}: MultiSelectProps) {
  const id = useId();
  const controlProps = { id, label, placeholder, options, value, onChange };

  return (
    <div className={className}>
      {label ? <Label htmlFor={id} text={label} /> : null}
      {variant === "dropdown" ? (
        <DropdownMultiSelect {...controlProps} />
      ) : (
        <AutocompleteMultiSelect {...controlProps} />
      )}
    </div>
  );
}
