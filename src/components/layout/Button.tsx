interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  outline?: boolean;
}

export default function Button({
  children,
  className,
  onClick,
  variant = "warning",
  size = "sm",
  outline = false,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}${outline ? " btn-outline" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
