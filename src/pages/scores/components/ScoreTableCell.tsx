import type { HTMLAttributes, ThHTMLAttributes } from "react";

export function ScoreValueCell({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`text-center text-xs font-bold ${className}`.trim()}
      {...props}
    />
  );
}

export function ScoreHeaderCell({
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`p-2 text-center ${className}`.trim()} {...props} />;
}
