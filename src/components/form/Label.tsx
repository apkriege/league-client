interface LabelProps {
  text: string;
  htmlFor?: string;
  className?: string;
}

export const Label = ({ htmlFor = "", text, className }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`fieldset-legend p-1 uppercase text-gray-500 font-semibold text-[10px] tracking-wider ${className}`}
    >
      {text}
    </label>
  );
};
