interface PageHeaderProps {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  iconText?: string;
}

export default function PageHeader({ title, subTitle, icon, iconText }: PageHeaderProps) {
  return (
    <>
      {icon && iconText && (
        <div className="badge badge-secondary mb-2 font-black rounded-full text-[10px] uppercase tracking-[0.18em]">
          {icon}
          <span>{iconText}</span>
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-black tracking-[-0.055em] leading-[0.95] mb-2 text-slate-950">
        {title}
      </h1>
      {subTitle && <p className="text-sm leading-6 text-gray-500 max-w-3xl">{subTitle}</p>}
    </>
  );
}
