import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";

type AppButtonVariant =
  | "accent"
  | "default"
  | "error"
  | "ghost"
  | "info"
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning";

interface ButtonProps extends Omit<MuiButtonProps, "color" | "size" | "variant"> {
  variant?: AppButtonVariant;
  size?: "xs" | "sm" | "md" | "lg";
  outline?: boolean;
}

const colorByVariant: Record<
  AppButtonVariant,
  "error" | "info" | "inherit" | "primary" | "secondary" | "success" | "warning"
> = {
  accent: "secondary",
  default: "inherit",
  error: "error",
  ghost: "inherit",
  info: "info",
  neutral: "inherit",
  primary: "primary",
  secondary: "secondary",
  success: "success",
  warning: "warning",
};

export default function Button({
  children,
  className,
  variant = "warning",
  size = "sm",
  outline = false,
  type = "button",
  sx,
  ...props
}: ButtonProps) {
  const muiSize = size === "lg" ? "large" : size === "md" ? "medium" : "small";
  const muiVariant = outline ? "outlined" : variant === "ghost" || variant === "default" ? "text" : "contained";

  return (
    <MuiButton
      type={type}
      color={colorByVariant[variant]}
      variant={muiVariant}
      size={muiSize}
      className={className}
      sx={[
        size === "xs" ? { minHeight: 26, px: 1.25, py: 0.25, fontSize: "0.6875rem" } : {},
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
