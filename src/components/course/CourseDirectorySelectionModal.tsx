import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import Button from "@/components/layout/Button";
import Modal from "@/components/layout/Modal";
import type { CourseImportSearchResult, ImportedCourse } from "@api/courses";

type CourseDirectorySelectionModalProps = {
  isOpen: boolean;
  results: CourseImportSearchResult[];
  attribution: string;
  preview: ImportedCourse | null;
  loadingId: string | null;
  confirmationDescription: string;
  confirmLabel: string;
  confirmingLabel: string;
  warningDescription?: string;
  showWarnings?: boolean;
  emptyContent?: ReactNode;
  emptyTitle?: string;
  resultsFooter?: ReactNode;
  onClose: () => void;
  onReview: (result: CourseImportSearchResult) => Promise<void>;
  onConfirm: () => Promise<void>;
  onBack: () => void;
};

export default function CourseDirectorySelectionModal({
  isOpen,
  results,
  attribution,
  preview,
  loadingId,
  confirmationDescription,
  confirmLabel,
  confirmingLabel,
  warningDescription,
  showWarnings = true,
  emptyContent,
  emptyTitle = "Course not found",
  resultsFooter,
  onClose,
  onReview,
  onConfirm,
  onBack,
}: CourseDirectorySelectionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={
        preview
          ? "Confirm this club and course"
          : results.length === 0 && emptyContent
            ? emptyTitle
            : "Select a course"
      }
      onClose={onClose}
      position="center"
      width="half"
    >
      {preview ? (
        <div>
          <p className="text-sm text-slate-600">{confirmationDescription}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Club</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{preview.club.name}</p>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 shrink-0" size={13} />
                {preview.club.location || "Location unavailable"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Course</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{preview.course.name}</p>
              <p className="mt-2 text-sm text-slate-500">
                {preview.course.numHoles} holes · Par {preview.course.par} ·{" "}
                {preview.course.tees.length} tees
              </p>
            </div>
          </div>

          {showWarnings && preview.warnings.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">
                {preview.warnings.length} data warning
                {preview.warnings.length === 1 ? "" : "s"} found
              </p>
              {warningDescription && (
                <p className="mt-1 text-xs text-amber-800">{warningDescription}</p>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => void onConfirm()}
              disabled={Boolean(loadingId)}
            >
              {loadingId === "confirm" ? confirmingLabel : confirmLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={Boolean(loadingId)}
            >
              Back to Results
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-400">{preview.attribution}</p>
        </div>
      ) : (
        <>
          {results.length === 0 ? (
            emptyContent || (
              <p className="text-sm text-slate-600">
                No matching courses were found. Try another course name.
              </p>
            )
          ) : (
            <>
              <p className="text-sm text-slate-600">Select the correct course by its location.</p>

              <div className="mt-4 space-y-3">
                {results.map((result) => (
                  <div
                    key={result.externalId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          Directory Match
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{result.courseName}</p>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={13} />
                          {result.location || "Location unavailable"}
                          {result.par ? ` · Par ${result.par}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {result.availabilityUnchecked
                            ? "Select to check GolfCourseAPI availability"
                            : `${result.maleTeeCount} men's tees · ${result.femaleTeeCount} women's tees`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => void onReview(result)}
                        disabled={Boolean(loadingId) || result.alreadyImported}
                      >
                        {result.alreadyImported
                          ? "Already Imported"
                          : loadingId === result.externalId
                            ? "Loading..."
                            : result.availabilityUnchecked
                              ? "Check & Load"
                              : "Select Course"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">{attribution}</p>
              {resultsFooter}
            </>
          )}
        </>
      )}
    </Modal>
  );
}
