import type { EventWizardType } from "./components/WizardType";

export function getDefaultEventBuilder(type: unknown, holeFormat: unknown): EventWizardType {
  return String(type).toLowerCase() === "tournament" || String(holeFormat).toLowerCase() === "mixed" ? "single" : "multi";
}
