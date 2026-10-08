import {
  getPlayerHandicapIndex,
  type ScoringHandicapEntry,
} from "../scoringSetup";
import { formatHandicap } from "@/utils/handicap";

type PlayerHandicapSummaryProps = {
  entry: ScoringHandicapEntry;
  className?: string;
  previewHandicap?: number;
};

export default function PlayerHandicapSummary({
  entry,
  previewHandicap,
  className = "text-[10px] text-gray-500",
}: PlayerHandicapSummaryProps) {
  const handicapIndex = previewHandicap ?? getPlayerHandicapIndex(entry);
  return (
    <span className={className}>
      {Number.isFinite(handicapIndex) ? `Handicap ${formatHandicap(handicapIndex)}${entry.firstRoundHandicap ? " (first round)" : ""}` : "Handicap calculated when all holes are entered"}
    </span>
  );
}
