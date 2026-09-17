import Button from "@/components/layout/Button";
import { Input, Select } from "@/components/form";
import { ClipboardPaste, ExternalLink, FileCheck2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { TeeFormData } from "../courseAdminForm";
import {
  applyUsgaRatingRows,
  parseUsgaRatingTable,
  parseUsgaCourseId,
  suggestUsgaTeeMatches,
  type UsgaRatingRow,
} from "../usgaRatingImport";

type UsgaRatingImportProps = {
  courseId: string;
  courseName: string;
  courseLocation: string;
  holeCount: number;
  tees: TeeFormData[];
  onCourseIdChange: (value: string) => void;
  onApply: (tees: TeeFormData[]) => void;
};

const formatNine = (rating: number | null, slope: number | null) =>
  rating == null || slope == null ? "—" : `${rating} / ${slope}`;

export default function UsgaRatingImport({
  courseId,
  courseName,
  courseLocation,
  holeCount,
  tees,
  onCourseIdChange,
  onApply,
}: UsgaRatingImportProps) {
  const [pastedTable, setPastedTable] = useState("");
  const [rows, setRows] = useState<UsgaRatingRow[]>([]);
  const [teeIndexes, setTeeIndexes] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [nineSide, setNineSide] = useState<"front" | "back">("front");

  const [lookupMessage, setLookupMessage] = useState("");
  const numericCourseId = parseUsgaCourseId(courseId);
  const courseUrl = numericCourseId
    ? `https://ncrdb.usga.org/courseTeeInfo?CourseID=${numericCourseId}`
    : "";
  const state = courseLocation.split(",").at(-1)?.trim().slice(0, 2).toUpperCase() || "";
  const assignedCount = teeIndexes.filter((index) => index >= 0).length;
  const teeOptions = useMemo(
    () => [
      { value: -1, label: "Do not import" },
      ...tees.map((tee, index) => ({
        value: index,
        label: `${tee.name || `Tee ${index + 1}`} · ${tee.distance || "—"} yards`,
      })),
    ],
    [tees],
  );

  const previewTable = (table: string) => {
    if (!numericCourseId) {
      setError("Paste the USGA course page URL or enter its Course ID first.");
      return;
    }

    try {
      const parsedRows = parseUsgaRatingTable(table);
      setRows(parsedRows);
      setTeeIndexes(suggestUsgaTeeMatches(parsedRows, tees));
      setError("");
    } catch (parseError) {
      setRows([]);
      setTeeIndexes([]);
      setError(parseError instanceof Error ? parseError.message : "Unable to read the pasted table.");
    }
  };

  const preview = () => previewTable(pastedTable);

  const pasteAndPreview = async () => {
    try {
      const table = await navigator.clipboard.readText();
      setPastedTable(table);
      previewTable(table);
    } catch {
      setError("Clipboard access was blocked. Paste the copied USGA table into the box instead.");
    }
  };

  const copyLookupName = () => {
    void navigator.clipboard.writeText(courseName).then(
      () => setLookupMessage(`${courseName} copied. Search in ${state || "the course state"}.`),
      () => setLookupMessage(`Search for ${courseName} in ${state || "the course state"}.`),
    );
  };

  const apply = () => {
    try {
      onApply(applyUsgaRatingRows(
        tees,
        rows,
        teeIndexes,
        holeCount <= 9 ? { nineSide } : {},
      ));
      setError("");
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Unable to apply USGA ratings.");
    }
  };

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-2.5 text-emerald-300">
            <FileCheck2 size={16} />
          </div>
          <div>
            <p className="text-sm font-bold">USGA rating verification</p>
            <p className="mt-1 text-xs text-slate-400">
              Optional second step after GolfCourseAPI import.
            </p>
          </div>
        </div>
        {courseUrl ? (
          <a
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            href={courseUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open USGA course <ExternalLink size={13} />
          </a>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Find the USGA course</p>
            <p className="mt-1 text-xs text-slate-500">
              {courseName} · {courseLocation || "Location unavailable"}
            </p>
            {lookupMessage ? <p className="mt-2 text-xs text-emerald-700">{lookupMessage}</p> : null}
          </div>
          <a
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            href="https://ncrdb.usga.org/countries/topic-overview"
            target="_blank"
            rel="noreferrer"
            onClick={copyLookupName}
          >
            <Search size={13} /> Open lookup & copy name
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <Input
            dense
            label="USGA Course ID or page URL"
            type="text"
            inputMode="url"
            placeholder="9788 or paste the course page URL"
            value={courseId}
            onChange={(event) => onCourseIdChange(event.target.value)}
            onBlur={() => {
              const parsed = parseUsgaCourseId(courseId);
              if (parsed) onCourseIdChange(String(parsed));
            }}
            onPaste={(event) => {
              const parsed = parseUsgaCourseId(event.clipboardData.getData("text"));
              if (!parsed) return;
              event.preventDefault();
              onCourseIdChange(String(parsed));
              setError("");
            }}
          />
          <div>
            <label
              className="mb-1 block text-[11px] font-semibold text-slate-600"
              htmlFor="usga-rating-table"
            >
              Pasted USGA tee table
            </label>
            <textarea
              id="usga-rating-table"
              className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              value={pastedTable}
              onChange={(event) => setPastedTable(event.target.value)}
              onPaste={(event) => {
                const table = event.clipboardData.getData("text");
                if (!table) return;
                event.preventDefault();
                setPastedTable(table);
                previewTable(table);
              }}
              placeholder="On the USGA page, copy the full tee table including the header row, then paste it here."
            />
          </div>
        </div>

        {holeCount <= 9 ? (
          <Select
            dense
            label="Nine represented on the USGA page"
            value={nineSide}
            options={[
              { value: "front", label: "Front nine" },
              { value: "back", label: "Back nine" },
            ]}
            onChange={(event) => setNineSide(event.target.value === "back" ? "back" : "front")}
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" outline onClick={preview}>
            Preview matches
          </Button>
          <Button type="button" variant="primary" onClick={() => void pasteAndPreview()}>
            <ClipboardPaste size={14} /> Paste & preview
          </Button>
          <p className="text-xs text-slate-500">
            Nothing changes until you review the matches and apply them.
          </p>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[850px] w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-3 py-3">USGA tee</th>
                    <th className="px-3 py-3">Gender</th>
                    <th className="px-3 py-3 text-right">Full</th>
                    <th className="px-3 py-3 text-right">Front</th>
                    <th className="px-3 py-3 text-right">Back</th>
                    <th className="min-w-56 px-3 py-3">Apply to</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr key={`${row.teeName}-${row.gender}-${index}`} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-900">{row.teeName}</p>
                        {row.teeId != null ? (
                          <p className="mt-0.5 text-slate-400">Tee ID {row.teeId}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 capitalize text-slate-600">{row.gender}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-800">
                        {row.rating} / {row.slope}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                        {formatNine(row.frontRating, row.frontSlope)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                        {formatNine(row.backRating, row.backSlope)}
                      </td>
                      <td className="px-3 py-3">
                        <Select
                          dense
                          ariaLabel={`Local tee for ${row.teeName} ${row.gender}`}
                          value={teeIndexes[index] ?? -1}
                          options={teeOptions}
                          onChange={(event) =>
                            setTeeIndexes((current) =>
                              current.map((value, currentIndex) =>
                                currentIndex === index ? Number(event.target.value) : value,
                              ),
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {assignedCount} of {rows.length} rows will be imported. Unmatched rows remain unchanged.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={apply}
                disabled={assignedCount === 0}
              >
                Apply reviewed ratings
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
