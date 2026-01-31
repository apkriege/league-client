interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return <div className={`divider my-0! ${className}`}></div>;
}
