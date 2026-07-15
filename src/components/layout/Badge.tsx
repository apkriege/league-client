interface BadgeProps {
  text: string;
  icon?: React.ReactNode;
  variant?: "" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export default function Badge({ text, icon, variant, className, size }: BadgeProps) {
  const s = {
    xs: "px-2 py-1 text-[8px] gap-1",
    sm: "px-2 py-1 text-[10px] gap-1",
    md: "px-3 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2",
  };

  const v = variant ? `bg-${variant} text-${variant}-content` : "bg-gray-200 text-gray-800";

  return (
    <div
      className={`mb-2 flex w-fit items-center rounded-full font-semibold ${v} ${s[size || "sm"]}${className ? ` ${className}` : ""}`}
    >
      {icon}
      <span className="uppercase">{text}</span>
    </div>
  );
}
