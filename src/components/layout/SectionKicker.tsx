import type { HTMLAttributes } from "react";

type KickerElement = "div" | "h2" | "h3" | "p" | "span";

type SectionKickerProps = HTMLAttributes<HTMLElement> & {
  as?: KickerElement;
};

export default function SectionKicker({
  as: Component = "p",
  className = "",
  ...props
}: SectionKickerProps) {
  return <Component className={`section-kicker ${className}`.trim()} {...props} />;
}
