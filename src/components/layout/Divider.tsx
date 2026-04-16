interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return <div className={`border-t border-base-300 my-6 ${className || ""}`} />;
}
