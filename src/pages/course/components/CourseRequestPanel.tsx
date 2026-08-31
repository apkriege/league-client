import { useState } from "react";
import { MailPlus, Search } from "lucide-react";
import { Input } from "@/components/form";
import CourseDirectorySelectionModal from "@/components/course/CourseDirectorySelectionModal";
import Button from "@/components/layout/Button";
import { useToast } from "@/context/useToast";
import { useCourseDirectorySelection } from "@/hooks/useCourseDirectorySelection";
import type { ManualCourseRequest } from "@api/courses";
import { useRequestCourse, useRequestManualCourse } from "@api/courses/mutations";
import ManualCourseRequestForm from "./ManualCourseRequestForm";

export default function CourseRequestPanel() {
  const { show } = useToast();
  const directory = useCourseDirectorySelection();
  const requestCourse = useRequestCourse();
  const requestManualCourse = useRequestManualCourse();
  const [manualRequest, setManualRequest] = useState<ManualCourseRequest>({
    courseName: "",
    city: "",
    state: "",
  });

  const handleConfirm = async () => {
    await directory.confirm(async ({ result }) => {
      await requestCourse.mutateAsync(result.externalId);
      show("Course request sent.", "success");
    }, "Unable to send that course request.");
  };

  const handleSearch = async () => {
    setManualRequest({
      courseName: directory.courseName.trim(),
      city: "",
      state: "",
    });
    await directory.search({ openWhenEmpty: true });
  };

  const handleManualChange = (field: keyof ManualCourseRequest, value: string) => {
    setManualRequest((current) => ({ ...current, [field]: value }));
  };

  const handleManualSubmit = async () => {
    const request = {
      courseName: manualRequest.courseName.trim(),
      city: manualRequest.city.trim(),
      state: manualRequest.state.trim(),
    };
    if (request.courseName.length < 2 || request.city.length < 2 || request.state.length < 2) {
      show("Course name, city, and state are required.", "error");
      return;
    }

    try {
      await requestManualCourse.mutateAsync(request);
      show("Manual course request sent.", "success");
      directory.reset();
      setManualRequest({ courseName: "", city: "", state: "" });
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to send that manual course request.";
      show(message, "error");
    }
  };

  return (
    <>
      <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-blue-200 bg-white p-2.5 text-blue-700">
            <MailPlus size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
              Request a Course
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Search by course name, verify the correct location, and send a request to have it
              added.
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
              if (event.key === "Enter") void handleSearch();
            }}
          />
          <Button
            type="button"
            variant="primary"
            onClick={() => void handleSearch()}
            disabled={
              directory.isSearching || requestCourse.isPending || requestManualCourse.isPending
            }
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
        loadingId={requestManualCourse.isPending ? "manual" : directory.loadingId}
        confirmationDescription="Verify that this is the exact club, course, and location you want added."
        confirmLabel="Verify & Send Request"
        confirmingLabel="Sending Request..."
        showWarnings={false}
        emptyTitle="Request a Course Manually"
        emptyContent={
          <ManualCourseRequestForm
            value={manualRequest}
            isSubmitting={requestManualCourse.isPending}
            onChange={handleManualChange}
            onSubmit={handleManualSubmit}
          />
        }
        resultsFooter={
          <div className="mt-5 border-t border-slate-200 pt-5">
            <ManualCourseRequestForm
              value={manualRequest}
              isSubmitting={requestManualCourse.isPending}
              onChange={handleManualChange}
              onSubmit={handleManualSubmit}
            />
          </div>
        }
        onClose={() => {
          if (!requestManualCourse.isPending) directory.close();
        }}
        onReview={directory.review}
        onConfirm={handleConfirm}
        onBack={directory.back}
      />
    </>
  );
}
