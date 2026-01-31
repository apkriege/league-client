interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Card({ title, subtitle, className, children, onClick }: CardProps) {
  return (
    <div
      className={`card p-4 bg-base-100 border border-base-content/20 rounded-lg w-full ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
