import { Database, Search } from "lucide-react";
import { Input } from "@/components/form";
import Button from "@/components/layout/Button";
import CourseDirectorySelectionModal from "@/components/course/CourseDirectorySelectionModal";
import { useCourseDirectorySelection } from "@/hooks/useCourseDirectorySelection";
import type { ImportedCourse } from "@api/courses";

type CourseImportSearchProps = {
  disabled?: boolean;
  onImport: (course: ImportedCourse) => Promise<void>;
};

export default function CourseImportSearch({
  disabled = false,
  onImport,
}: CourseImportSearchProps) {
  const directory = useCourseDirectorySelection();

  const handleConfirm = async () => {
    await directory.confirm(
      ({ course }) => onImport(course),
      "Unable to prepare that course.",
    );
  };

  return (
    <>
      <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-emerald-200 bg-white p-2.5 text-emerald-700">
            <Database size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Course Directory
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Search by course name, select the correct location, then review the imported tees and
              scorecard before creating it.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Input
            dense
            label="Course Name"
            placeholder="The Fortress"
            maxLength={120}
            value={directory.courseName}
            onChange={(event) => directory.setCourseName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void directory.search();
            }}
          />
          <Button
            type="button"
            variant="primary"
            onClick={() => void directory.search()}
            disabled={disabled || directory.isSearching}
          >
            <Search size={14} />
            {directory.isSearching ? "Searching..." : "Search Courses"}
          </Button>
        </div>
      </div>

      <CourseDirectorySelectionModal
        isOpen={directory.isOpen}
        results={directory.results}
        attribution={directory.attribution}
        preview={directory.preview}
        loadingId={directory.loadingId}
        confirmationDescription="Confirm both records before the club is created and the course form is populated."
        confirmLabel="Confirm & Load Into Form"
        confirmingLabel="Preparing..."
        warningDescription="The data will remain editable in the form before you create the course."
        onClose={directory.close}
        onReview={directory.review}
        onConfirm={handleConfirm}
        onBack={directory.back}
      />
    </>
  );
}
