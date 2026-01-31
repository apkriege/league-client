import { useState, useMemo } from "react";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  heading?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  search?: boolean;
}

export default function Table<T extends { id?: number | string }>({
  data,
  columns,
  heading = "",
  className = "",
  size = "md",
  search = true,
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

  return (
    <div className={`${className} bg-base-100 border border-base-content/20 rounded-lg w-full`}>
      <div className="flex justify-between items-center p-2">
        <p className="text-xs">{heading}</p>
        {search && (
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full max-w-xs h-8 text-xs"
          />
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-base-200 border-b border-t border-base-300">
              {columns.map((col, idx) => (
                <th
                  key={`header-${idx}`}
                  onClick={() => handleSort(col.key)}
                  style={{ width: col.width }}
                  className="text-xs px-4 py-3 text-left cursor-pointer hover:bg-base-300 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
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
                className={`border-base-300 hover:bg-base-100 transition-colors 
                  ${rowIdx === sortedData.length - 1 ? "" : "border-b"}`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={`col-${colIdx}`}
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
        <div className="text-center py-8 text-base-content/50">
          {searchTerm ? "No results found" : "No data to display"}
        </div>
      )}
    </div>
  );
}
