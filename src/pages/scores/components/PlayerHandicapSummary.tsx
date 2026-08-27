import {
  getPlayerHandicapIndex,
  type ScoringHandicapEntry,
} from "../scoringSetup";
import { formatWholeHandicap } from "@/utils/handicap";

type PlayerHandicapSummaryProps = {
  entry: ScoringHandicapEntry;
  className?: string;
};

export default function PlayerHandicapSummary({
  entry,
  className = "text-[10px] text-gray-500",
}: PlayerHandicapSummaryProps) {
  const storedHandicap = getPlayerHandicapIndex(entry);

  return <span className={className}>HCP {formatWholeHandicap(storedHandicap)}</span>;
}
