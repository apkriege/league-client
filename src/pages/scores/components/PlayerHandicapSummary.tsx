import {
  getPlayerHandicapIndex,
  type ScoringHandicapEntry,
} from "../scoringSetup";
import { formatHandicap } from "@/utils/handicap";

type PlayerHandicapSummaryProps = {
  entry: ScoringHandicapEntry;
  className?: string;
};

export default function PlayerHandicapSummary({
  entry,
  className = "text-[10px] text-gray-500",
}: PlayerHandicapSummaryProps) {
  const handicapIndex = getPlayerHandicapIndex(entry);
  return (
    <span className={className}>
      Handicap {formatHandicap(handicapIndex)}
    </span>
  );
}
