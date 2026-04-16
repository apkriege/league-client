interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: string;
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
      className={`btn btn-${variant} btn-${outline} btn-${size} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
