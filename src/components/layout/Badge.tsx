import Chip from "@mui/material/Chip";

interface BadgeProps {
  text: string;
  icon?: React.ReactNode;
  variant?: "" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const colorByVariant = {
  primary: "primary",
  secondary: "secondary",
  accent: "secondary",
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
} as const;

export default function Badge({ text, icon, variant, className, size = "sm" }: BadgeProps) {
  const color = variant ? colorByVariant[variant] : "default";

  return (
    <Chip
      className={`w-fit px-1 ${className}`}
      color={color}
      size={size === "lg" ? "medium" : "small"}
      label={
        <span className="flex items-center gap-1 uppercase">
          {icon}
          {text}
        </span>
      }
      sx={{
        mb: 1,
        height: size === "xs" ? 22 : size === "lg" ? 36 : size === "md" ? 30 : 26,
        fontSize: size === "xs" ? "0.5rem" : size === "sm" ? "0.625rem" : undefined,
      }}
    />
  );
}
