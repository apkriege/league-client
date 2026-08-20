import {
  getPlayerCourseHandicap,
  getPlayerHandicapIndex,
  type ScoringHandicapEntry,
} from "../scoringSetup";

type PlayerHandicapSummaryProps = {
  entry: ScoringHandicapEntry;
  className?: string;
};

const formatHandicapIndex = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default function PlayerHandicapSummary({
  entry,
  className = "text-[10px] text-gray-500",
}: PlayerHandicapSummaryProps) {
  const handicapIndex = getPlayerHandicapIndex(entry);
  const courseHandicap = getPlayerCourseHandicap(entry);

  return (
    <span className={className}>
      Index {formatHandicapIndex(handicapIndex)} · Course HCP {Math.round(courseHandicap)}
    </span>
  );
}
