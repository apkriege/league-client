import { Input, Select } from "@/components/form";
import { DEFAULT_STROKE_POINTS } from "@/pages/event/create/constants";
import MuiCheckbox from "@mui/material/Checkbox";
import { Target } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  SCORING_MODES,
  createDefaultScoringConfiguration,
  deriveScoringMode,
  getScoringModesForModel,
  type CompetitionModel,
  type MaximumScoreRule,
  type ScoringMode,
} from "../scoringModes";

type ScoringModeFieldsProps = {
  format: CompetitionModel;
  onModeChange?: () => void;
};

const maximumRuleOptions = [
  { value: "relative-to-par", label: "Strokes over par" },
  { value: "fixed", label: "Fixed score on every hole" },
  { value: "net-double-bogey", label: "Net double bogey" },
];

export default function ScoringModeFields({ format, onModeChange }: ScoringModeFieldsProps) {
  const methods = useFormContext();
  const rawMode = methods.watch("scoringMode");
  const mode = deriveScoringMode({
    format,
    scoringMode: rawMode,
  });
  const definition = SCORING_MODES[mode];
  const pointsEnabled = methods.watch("pointsEnabled") !== false;
  const maximumRule = methods.watch("scoringConfig.maximumScore") as MaximumScoreRule | undefined;
  const availableModes = getScoringModesForModel(format);

  useEffect(() => {
    if (definition.models.includes(format)) return;
    const fallback: ScoringMode = format === "team" ? "best-ball" : "stroke-play";
    methods.setValue("scoringMode", fallback, { shouldDirty: true });
    methods.setValue("scoringConfig", createDefaultScoringConfiguration(fallback), {
      shouldDirty: true,
    });
  }, [definition.models, format, methods]);

  const selectMode = (nextMode: ScoringMode) => {
    if (nextMode === mode) return;
    onModeChange?.();
    methods.setValue("scoringMode", nextMode, { shouldDirty: true });
    methods.setValue("scoringConfig", createDefaultScoringConfiguration(nextMode), {
      shouldDirty: true,
    });
    if (
      nextMode !== "match-play" &&
      nextMode !== "four-ball-match" &&
      !String(methods.getValues("strokePoints") || "").trim()
    ) {
      methods.setValue("strokePoints", DEFAULT_STROKE_POINTS, { shouldDirty: true });
    }
  };

  const updateMaximumRule = (type: MaximumScoreRule["type"]) => {
    const rule: MaximumScoreRule =
      type === "fixed"
        ? { type, strokes: 8 }
        : type === "relative-to-par"
          ? { type, strokesOverPar: 2 }
          : { type };
    methods.setValue("scoringConfig.maximumScore", rule, { shouldDirty: true });
  };

  const isMatch = mode === "match-play" || mode === "four-ball-match";
  const usesPlacementPoints = mode !== "stableford" && !isMatch;

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div>
        <Select
          label="Play format"
          value={mode}
          onChange={(event) => selectMode(event.target.value as ScoringMode)}
          options={availableModes.map((option) => ({ value: option.id, label: option.label }))}
          ariaLabel="Scoring play format"
        />
        <div className="mt-3 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950">
            <Target size={14} className="text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{definition.label}</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">{definition.description}</p>
          </div>
        </div>
      </div>

      {mode === "maximum-score" && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Hole cap
          </p>
          <div className="grid gap-3">
            <Select
              label="Maximum rule"
              value={maximumRule?.type || "relative-to-par"}
              onChange={(event) => updateMaximumRule(event.target.value as MaximumScoreRule["type"])}
              options={maximumRuleOptions}
            />
            {maximumRule?.type === "fixed" && (
              <Input
                label="Maximum strokes"
                type="number"
                min={1}
                {...methods.register("scoringConfig.maximumScore.strokes", {
                  valueAsNumber: true,
                })}
              />
            )}
            {maximumRule?.type === "relative-to-par" && (
              <Input
                label="Strokes over par"
                type="number"
                min={0}
                {...methods.register("scoringConfig.maximumScore.strokesOverPar", {
                  valueAsNumber: true,
                })}
              />
            )}
          </div>
        </div>
      )}

      {mode === "stableford" && (
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">
            Stableford point scale
          </summary>
          <p className="mt-2 text-xs text-slate-500">
            Standard points are already set. Open this only when your league uses a custom scale.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["albatrossOrBetter", "Albatross or better"],
              ["eagle", "Eagle"],
              ["birdie", "Birdie"],
              ["par", "Par"],
              ["bogey", "Bogey"],
              ["doubleBogeyOrWorse", "Double bogey+"]
            ].map(([key, label]) => (
              <Input
                key={key}
                label={label}
                type="number"
                min={0}
                {...methods.register(`scoringConfig.stablefordPointScale.${key}`, {
                  valueAsNumber: true,
                })}
              />
            ))}
          </div>
        </details>
      )}

      {mode === "four-ball-match" && (
        <div>
          <Input
            label="Handicap allowance"
            type="number"
            min={0}
            max={1}
            step={0.05}
            {...methods.register("scoringConfig.handicapAllowance", { valueAsNumber: true })}
          />
          <p className="mt-1 text-[11px] text-slate-500">Use 1.00 for 100% or 0.90 for 90%.</p>
        </div>
      )}

      {!isMatch && (
        <div>
          <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs">
            <MuiCheckbox
              checked={pointsEnabled}
              onChange={(event) =>
                methods.setValue("pointsEnabled", event.target.checked, { shouldDirty: true })
              }
              size="small"
              sx={{ mt: -0.5, p: 0.5 }}
            />
            <span>
              <span className="block font-bold text-slate-900">Award season points</span>
              <span className="mt-0.5 block leading-4 text-slate-500">
                Disable this when the event should affect results without adding season points.
              </span>
            </span>
          </label>
          {usesPlacementPoints && (
            <div className="mt-3">
              <Input
                label="Placement points"
                placeholder={`e.g. ${DEFAULT_STROKE_POINTS}`}
                disabled={!pointsEnabled}
                {...methods.register("strokePoints")}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Comma-separated from first place down. Leave blank to award hole-performance points.
              </p>
            </div>
          )}
        </div>
      )}

      {isMatch && (
        <div className="grid gap-3">
          <Input
            label="Points per hole"
            type="number"
            min={0}
            {...methods.register("ptsPerHole", { valueAsNumber: true })}
          />
          {mode === "match-play" && (
            <Input
              label="Points per player match"
              type="number"
              min={0}
              {...methods.register("ptsPerMatch", { valueAsNumber: true })}
            />
          )}
          {format === "team" && (
            <Input
              label="Points per team win"
              type="number"
              min={0}
              {...methods.register("ptsPerTeamWin", { valueAsNumber: true })}
            />
          )}
        </div>
      )}
    </div>
  );
}
