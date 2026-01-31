import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

interface IconProps extends LucideProps {
  icon: ComponentType<LucideProps>;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

/**
 * Icon wrapper component for Lucide React icons
 * @param icon - The Lucide icon component to render
 * @param size - Icon size in pixels (default: 24)
 * @param className - Additional CSS classes
 * @param color - Icon color (default: currentColor)
 * @param strokeWidth - Stroke width for the icon (default: 2)
 */
export const Icon = ({
  icon: IconComponent,
  size = 48,
  className = "",
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: IconProps) => {
  const rounded = size >= 40 ? "rounded-lg" : "rounded-md";

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={`inline-flex ${className} ${rounded} bg-sky-200 text-blue-600 p-0.5`}
      {...props}
    />
  );
};
