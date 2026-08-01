import { useState, useMemo } from "react";
import { Input } from "./form";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  // Width for table body cells; falls back to width when not provided.
  cellWidth?: string;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  heading?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "clean";
  noBorder?: boolean;
  search?: boolean;
  searchPlaceholder?: string;
  headerActions?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export default function Table<T>({
  data,
  columns,
  heading = "",
  className = "",
  size = "md",
  variant = "default",
  noBorder = false,
  search = true,
  searchPlaceholder = "Search...",
  headerActions,
  onRowClick,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];
        const stringValue = String(value || "").toLowerCase();
        return stringValue.includes(lowerSearch);
      })
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      if (typeof aValue === "number") {
        return sortConfig.direction === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }

      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIndicator = (key: keyof T) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  const sizeClasses = {
    sm: "!text-xs",
    md: "!text-sm",
    lg: "!text-base",
  };

  const paddingClasses = {
    sm: "px-2 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };

  const variantClasses = {
    default: {
      container: "bg-white border rounded-3xl shadow-sm overflow-hidden",
      containerNoBorder: "bg-white rounded-3xl shadow-sm overflow-hidden",
      header: "px-4 py-3 border-b border-black/5",
      heading: "text-blue-800",
      theadRow: "bg-[#f4f7fb]/80 border-b border-slate-200",
      headerCell: "hover:bg-sky-100/40 text-gray-600",
      row: "border-slate-200 hover:bg-sky-50/50",
      empty: "text-slate-900/50",
    },
    clean: {
      container: "overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm",
      containerNoBorder: "overflow-hidden rounded-3xl bg-white shadow-sm",
      header: "border-b border-gray-100 px-4 py-3",
      heading: "text-blue-800",
      theadRow: "bg-[#f4f7fb]/80 border-b border-gray-100",
      headerCell: "hover:bg-sky-100/50 text-gray-500",
      row: "border-gray-100 hover:bg-sky-50/60",
      empty: "text-gray-400",
    },
  };

  const currentVariant = variantClasses[variant];
  const containerClass = noBorder ? currentVariant.containerNoBorder : currentVariant.container;
  const hasHeading = heading.trim().length > 0;
  const hasHeaderContent = hasHeading || search || Boolean(headerActions);

  return (
    <div className={`${className} ${containerClass} w-full`}>
      {hasHeaderContent && (
        <div
          className={`flex items-center gap-3 ${hasHeading ? "justify-between" : "justify-end"} ${currentVariant.header}`}
        >
          {hasHeading && (
            <p
              className={`ml-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${currentVariant.heading}`}
            >
              {heading}
            </p>
          )}
          <div className="flex items-center gap-2">
            {search && (
              <Input
                dense
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56"
              />
            )}
            {headerActions}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={currentVariant.theadRow}>
              {columns.map((col, idx) => (
                <th
                  key={`header-${idx}`}
                  onClick={() => handleSort(col.key)}
                  style={{ width: col.width ?? col.cellWidth }}
                  className={`cursor-pointer px-4 py-3 text-left text-xs font-black transition-colors ${currentVariant.headerCell}`}
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span>{col.label}</span>
                    {getSortIndicator(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${currentVariant.row} transition-colors 
                  ${rowIdx === sortedData.length - 1 ? "" : "border-b"} ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={`col-${colIdx}`}
                    style={{ width: col.cellWidth ?? col.width }}
                    className={`px-4 py-2 ${sizeClasses[size]} ${paddingClasses[size]}`}
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData.length === 0 && (
        <div className={`py-8 text-center ${currentVariant.empty}`}>
          {searchTerm ? "No results found" : "No data to display"}
        </div>
      )}
    </div>
  );
}
