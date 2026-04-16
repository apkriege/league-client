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
        <div className="badge badge-secondary mb-2 font-semibold rounded-full text-[10px]">
          {icon}
          <span>{iconText}</span>
        </div>
      )}
      <h1 className="text-3xl font-extrabold mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-6 w-3/5">{subTitle}</p>
    </>
  );
}
