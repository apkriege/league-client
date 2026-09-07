type HandicapStrokeIndicatorProps = {
  strokes: number;
};

export default function HandicapStrokeIndicator({ strokes }: HandicapStrokeIndicatorProps) {
  const value = Math.trunc(Number(strokes));
  if (!value) return null;

  if (value < 0) {
    return (
      <span
        className="score-medals text-[8px] font-black leading-none text-amber-700"
        aria-label={`Adds ${Math.abs(value)} handicap ${Math.abs(value) === 1 ? "stroke" : "strokes"}`}
      >
        +{Math.abs(value)}
      </span>
    );
  }

  return (
    <span
      className="score-medals"
      aria-label={`Receives ${value} handicap ${value === 1 ? "stroke" : "strokes"}`}
    >
      {Array.from({ length: value }).map((_, index) => (
        <span key={index} className="h-1 w-1 rounded-full bg-slate-900" />
      ))}
    </span>
  );
}
