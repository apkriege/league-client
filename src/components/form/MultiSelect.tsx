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
      {label && <legend className="fieldset-legend p-0.5">{label}</legend>}

      <div className="relative" ref={containerRef}>
        <div
          className="flex items-center gap-2 px-2 py-2 border border-base-content/20 rounded-lg cursor-pointer h-[35px] overflow-x-auto overflow-y-hidden whitespace-nowrap"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs shrink-0 whitespace-nowrap"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(opt.value);
                  }}
                  className="hover:bg-blue-600 rounded p-0.5 shrink-0"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 border rounded-lg bg-base-100 shadow-lg z-10">
            <ul className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <li key={option.value}>
                  <label className="flex items-center gap-2 px-3 py-2 hover:bg-base-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => handleSelect(option.value)}
                      className="w-3 h-3 accent-blue-500 cursor-pointer rounded"
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
