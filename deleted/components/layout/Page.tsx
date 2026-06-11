interface HeaderProps {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Header = ({ title, subTitle, icon, children }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h1>
        {subTitle && <p className="text-sm text-base-content/70">{subTitle}</p>}
      </div>
      {children}
    </div>
  );
};
