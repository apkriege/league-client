import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface MultiSelectOption {
  value: any;
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string | number) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <fieldset className={`fieldset ${className}`}>
      {label ? (
        <legend className="fieldset-legend p-1 uppercase text-gray-500 font-semibold text-[10px] tracking-wider">
          {label}
        </legend>
      ) : null}

      <div className="relative" ref={containerRef}>
        <div
          className="w-full min-h-[35px] rounded-md bg-base-200 border border-base-300 px-2 py-1 text-xs cursor-pointer flex items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-base-300 text-base-content rounded text-[11px] shrink-0 whitespace-nowrap"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(opt.value);
                  }}
                  className="hover:bg-base-content/10 rounded p-0.5 shrink-0"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-base-content/50">{placeholder}</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-base-300 rounded-md bg-base-100 shadow-lg z-10">
            <ul className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <li key={option.value}>
                  <label className="flex items-center gap-2 px-3 py-2 hover:bg-base-200 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => handleSelect(option.value)}
                      className="w-3 h-3 accent-primary cursor-pointer rounded"
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </fieldset>
  );
}
