import type { HoleFormData } from "../courseAdminForm";
import Input from "@/components/form/Input";
import Table from "@/components/Table";

type HoleChangeHandler = (
  teeIndex: number,
  holeIndex: number,
  field: keyof HoleFormData,
  value: string,
) => void;

export default function ScorecardInputTable({
  title,
  holes,
  teeIndex,
  startIndex,
  onHoleChange,
}: {
  title: string;
  holes: HoleFormData[];
  teeIndex: number;
  startIndex: number;
  onHoleChange: HoleChangeHandler;
}) {
  if (holes.length === 0) return null;

  const totalDistance = holes.reduce((sum, hole) => sum + Number(hole.dis || 0), 0);
  const totalPar = holes.reduce((sum, hole) => sum + Number(hole.par || 0), 0);
  const scoreRows: Array<{
    label: string;
    total: string;
    field: keyof Pick<HoleFormData, "dis" | "par" | "hcp">;
  }> = [
    { label: "Yards", total: String(totalDistance), field: "dis" },
    { label: "Par", total: String(totalPar), field: "par" },
    { label: "HCP", total: "—", field: "hcp" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <Table
        data={scoreRows}
        search={false}
        variant="clean"
        noBorder
        tableClassName="min-w-[820px] border-separate border-spacing-0 bg-white text-xs"
        renderTable={(visibleRows) => (
          <>
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                <th className="w-24 rounded-tl-2xl px-2.5 py-2.5 text-left">{title}</th>
                {holes.map((hole) => (
                  <th key={`${title}-${hole.num}`} className="px-1.5 py-2.5 text-center">
                    {hole.num}
                  </th>
                ))}
                <th className="rounded-tr-2xl px-2.5 py-2.5 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <ScorecardInputRow
                  key={row.field}
                  label={row.label}
                  holes={holes}
                  total={row.total}
                  field={row.field}
                  teeIndex={teeIndex}
                  startIndex={startIndex}
                  onHoleChange={onHoleChange}
                />
              ))}
            </tbody>
          </>
        )}
      />
    </div>
  );
}

function ScorecardInputRow({
  label,
  holes,
  total,
  field,
  teeIndex,
  startIndex,
  onHoleChange,
}: {
  label: string;
  holes: HoleFormData[];
  total: string;
  field: keyof Pick<HoleFormData, "dis" | "par" | "hcp">;
  teeIndex: number;
  startIndex: number;
  onHoleChange: HoleChangeHandler;
}) {
  return (
    <tr className="border-t border-slate-200 text-sm text-slate-700">
      <th scope="row" className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </th>
      {holes.map((hole, offset) => (
        <td key={`${label}-${hole.num}`} className="px-1.5 py-1.5">
          <Input
            dense
            type="number"
            value={String(hole[field] ?? "")}
            onChange={(event) => onHoleChange(teeIndex, startIndex + offset, field, event.target.value)}
            className="w-16 min-w-0"
            aria-label={`${label} for hole ${hole.num}`}
          />
        </td>
      ))}
      <td className="px-2.5 py-2 text-center text-xs font-semibold text-slate-900">{total}</td>
    </tr>
  );
}
