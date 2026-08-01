import type { HTMLAttributes } from "react";

export default function TableHeaderRow({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`section-kicker ${className}`.trim()} {...props} />;
}
