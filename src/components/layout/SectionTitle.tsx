interface SectionTitleProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const SectionTitle = ({ title, description, icon }: SectionTitleProps) => (
  <div className="flex items-center mb-4">
    {icon && <div className="mr-1">{icon}</div>}
    <div className="">
      <h2 className="text-lg font-bold leading-5">{title}</h2>
      {description && <p className="text-xs text-gray-600 italic">{description}</p>}
    </div>
  </div>
);

export const SectionTitleStacked = ({ title, description, icon }: SectionTitleProps) => (
  <div className="flex flex-col items-start mb-4">
    <div className="flex items-center justify-center">
      {icon && <div className="mb-1">{icon}</div>}
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    <div className="">
      {description && <p className="text-xs text-gray-600 italic">{description}</p>}
    </div>
  </div>
);
