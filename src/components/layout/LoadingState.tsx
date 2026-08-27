import type { HTMLAttributes } from "react";

export default function LoadingState({
  className = "",
  children = "Loading...",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`loading-state ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
