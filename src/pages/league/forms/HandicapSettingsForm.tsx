import { useHandicapBasis } from "./useHandicapBasis";
import { Input, Select } from "@/components/form";
import { Controller, useFormContext } from "react-hook-form";
import { handicapHoleLimits, validateHandicapSettings, type HandicapSettings } from "@/features/leagues/handicapSettings";

export default function HandicapSettingsForm({ locked }: { locked: boolean }) {
  const { control, watch } = useFormContext<HandicapSettings>();
  const setHandicapBasis = useHandicapBasis();
  const settings = watch();
  const error = validateHandicapSettings(settings);
  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 items-end gap-4">
        {(["handicapBestRounds", "handicapWindow"] as const).map((name) => (
          <Controller key={name} name={name} control={control} render={({ field }) => (
            <Input {...field} type="number" label={name === "handicapBestRounds" ? "Best rounds (X)" : "Recent rounds (Y)"}
              min={4} max={20} step={1} disabled={locked}
              onChange={(event) => field.onChange(event.target.value === "" ? "" : Number(event.target.value))} />
          )} />
        ))}
        <Controller name="handicapMultiplier" control={control} render={({ field }) => (
          <Input {...field} type="number" label="Handicap multiplier" min={0.01} max={1} step={0.01} disabled={locked}
            onChange={(event) => field.onChange(event.target.value === "" ? "" : Number(event.target.value))} />
        )} />
        <Controller name="handicapHoleBasis" control={control} render={({ field }) => (
          <Select label="Handicap basis" value={field.value} disabled={locked}
            options={[{ value: 9, label: "9 holes" }, { value: 18, label: "18 holes" }]}
            onChange={(event) => setHandicapBasis(Number(event.target.value) === 9 ? 9 : 18)} />
        )} />
        <Controller name="handicapHoleLimit" control={control} render={({ field }) => (
          <Select label="Maximum hole score for handicap" value={field.value} disabled={locked}
            options={handicapHoleLimits} onChange={(event) => field.onChange(event.target.value)} />
        )} />
      </div>
      {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
      <p className="text-xs text-slate-500">
        Average every round through the first X rounds, then the best X of the latest Y.
        Multiply the average by the handicap multiplier (1.00 = 100%, 0.96 = 96%).
        Mixed-length rounds normalize to the selected basis. Settings stay fixed for this season.
        Without a starting handicap, the first complete individual round establishes one and scores that event.
      </p>
      {settings.handicapHoleLimit === "handicap-adjusted" ? (
        <p className="text-xs text-slate-500">Net double bogey uses the handicap before the round; without one, the limit is par + 5.</p>
      ) : null}
    </div>
  );
}
