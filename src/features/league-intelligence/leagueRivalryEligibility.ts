import { getScoringFamilyForEvent } from "../scoring/scoringModes";
import type { IntelligenceEvent } from "./types";

export const hasCompletedMatchPlayEvent = (events: IntelligenceEvent[]) =>
  events.some((event) =>
    ["complete", "completed"].includes(String(event.status).toLowerCase()) &&
    getScoringFamilyForEvent(event) === "match",
  );
