import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

interface SummaryPillProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  strong?: boolean;
}

export default function SummaryPill({
  icon,
  strong = false,
  className = "",
  children,
  ...props
}: SummaryPillProps) {
  return (
    <div className={`summary-pill ${className}`.trim()} {...props}>
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className={strong ? "font-semibold text-gray-800" : undefined}>{children}</span>
    </div>
  );
}

export function SummaryPillButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`summary-pill cursor-pointer transition-colors ${className}`.trim()}
      {...props}
    />
  );
}
