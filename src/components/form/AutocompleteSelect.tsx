import { useEffect, useMemo, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption?.label ?? "");
    }
  }, [isOpen, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return options;

    return options.filter((option) => option.label.toLowerCase().includes(search));
  }, [options, query]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, isOpen]);

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value, option);
    setQuery(option.label);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter" && isOpen && filteredOptions.length > 0) {
      event.preventDefault();
      handleSelect(filteredOptions[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <fieldset className={`fieldset ${className}`}>
      {label ? (
        <legend className="fieldset-legend p-1 uppercase text-gray-500 font-black text-[10px] tracking-[0.18em]">
          {label}
        </legend>
      ) : null}

      <div className="relative" ref={containerRef}>
        <input
          type="text"
          className="input w-full text-xs h-[35px] rounded-2xl bg-white/70 border-base-300 pr-14 font-semibold"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setIsOpen(true);

            if (!nextQuery) {
              onChange(undefined);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {clearable && !disabled && query ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-base-content"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            Clear
          </button>
        ) : null}

        {isOpen && !disabled ? (
          <div className="absolute top-full left-0 right-0 mt-1 z-20 border border-base-300 rounded-2xl bg-base-100 shadow-lg overflow-hidden">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500">{noResultsText}</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto">
                {filteredOptions.map((option, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isSelected = option.value === selectedOption?.value;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                          isHighlighted ? "bg-base-200" : ""
                        } ${isSelected ? "text-primary font-medium" : "text-base-content"}`}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => handleSelect(option)}
                      >
                        {option.content ?? option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
