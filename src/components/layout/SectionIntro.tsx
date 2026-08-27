import type { HTMLAttributes, ReactNode } from "react";

interface SectionIntroProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
}

export default function SectionIntro({
  title,
  description,
  className = "",
  ...props
}: SectionIntroProps) {
  return (
    <div className={`mb-3 ${className}`.trim()} {...props}>
      <h3 className="text-lg font-bold tracking-tight text-gray-800">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  );
}
