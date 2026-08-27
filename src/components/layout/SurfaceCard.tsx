import type { HTMLAttributes } from "react";

type SurfaceElement = "aside" | "div" | "section";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  as?: SurfaceElement;
};

export default function SurfaceCard({
  as: Component = "div",
  className = "",
  ...props
}: SurfaceCardProps) {
  return <Component className={`surface-card ${className}`.trim()} {...props} />;
}
