import { ImagePlus, X } from "lucide-react";

export const SCORECARD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type ScorecardImageInputProps = {
  file: File | null;
  disabled: boolean;
  onChange: (file: File | null) => void;
  onError: (message: string) => void;
};

export default function ScorecardImageInput({
  file,
  disabled,
  onChange,
  onError,
}: ScorecardImageInputProps) {
  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!acceptedTypes.has(selected.type)) {
      onError("Scorecard image must be a JPEG, PNG, or WebP file.");
      return;
    }
    if (selected.size > SCORECARD_IMAGE_MAX_BYTES) {
      onError("Scorecard image must be 5 MB or smaller.");
      return;
    }
    onChange(selected);
  };

  return (
    <div className="mt-4">
      <p className="text-sm font-bold text-slate-700">Scorecard image <span className="font-normal text-slate-400">(optional)</span></p>
      {file ? (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB · Attached to request</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-50"
            disabled={disabled}
            aria-label="Remove scorecard image"
            onClick={() => onChange(null)}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-emerald-400 hover:bg-emerald-50/50">
          <ImagePlus size={17} />
          Upload scorecard photo
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </label>
      )}
      <p className="mt-1.5 text-xs text-slate-400">JPEG, PNG, or WebP · Up to 5 MB</p>
    </div>
  );
}
