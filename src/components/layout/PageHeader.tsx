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
        <Badge text={iconText} icon={icon} variant="secondary" className="mb-2" size="sm" />
      )}
      <h1 className="text-3xl md:text-4xl font-black tracking-[-0.055em] leading-[0.95] mb-2 text-slate-950">
        {title}
      </h1>
      {subTitle && <p className="text-sm leading-6 text-gray-500 max-w-3xl">{subTitle}</p>}
    </>
  );
}
import Badge from "./Badge";
