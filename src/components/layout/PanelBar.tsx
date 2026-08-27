import type { HTMLAttributes } from "react";

type PanelBarProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "header" | "row";
};

export default function PanelBar({
  variant = "row",
  className = "",
  ...props
}: PanelBarProps) {
  const baseClass = variant === "header" ? "panel-header" : "panel-row";
  return <div className={`${baseClass} ${className}`.trim()} {...props} />;
}
