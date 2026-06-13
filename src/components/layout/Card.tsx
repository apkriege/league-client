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
      className={`app-page-card card p-5 bg-base-100 border rounded-3xl w-full ${className || ""}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm leading-6 text-gray-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
