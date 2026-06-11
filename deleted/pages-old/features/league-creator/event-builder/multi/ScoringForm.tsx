import { Controller, useFormContext } from "react-hook-form";
import { Input, Select } from "@/components/form";

export default function ScoringForm() {
  const { control, watch } = useFormContext();

  return (
    <div className="grid grid-cols-5 gap-4">
      <Controller
        name="scoringFormat"
        control={control}
        render={({ field }) => {
          return (
            <Select
              label="Scoring Format"
              placeholder="Select Scoring Format"
              value={field.value || ""}
              onChange={(e) => {
                field.onChange(e.target.value);
              }}
              options={[
                { value: "stroke", label: "Stroke Play" },
                { value: "match", label: "Match Play" },
              ]}
            />
          );
        }}
      />
      {watch("scoringFormat") === "match" ? (
        <div className="col-span-4 grid grid-cols-3 gap-4">
          <Controller
            name="ptsPerHole"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  label="Points Per Hole"
                  placeholder="Enter points per hole"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              );
            }}
          />
          <Controller
            name="ptsPerMatch"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  label="Points Per Match"
                  placeholder="Enter points per match"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              );
            }}
          />
          <Controller
            name="ptsPerTeamWin"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  label="Points Per Team Win"
                  placeholder="Enter points per team win"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              );
            }}
          />
        </div>
      ) : (
        <div className="col-span-4">
          <Controller
            name="strokePoints"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  label="Stroke Points"
                  placeholder="Enter stroke points"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
