interface LabelProps {
  text: string;
  htmlFor?: string;
  className?: string;
}

export const Label = ({ htmlFor = "", text, className }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block p-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 ${className}`}
    >
      {text}
    </label>
  );
};
