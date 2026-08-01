import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  loadCourseImport,
  searchCourseDirectory,
  type CourseImportSearchResult,
  type ImportedCourse,
} from "@api/courses";

export type CourseDirectorySelection = {
  result: CourseImportSearchResult;
  course: ImportedCourse;
};

type CourseDirectorySearchOptions = {
  openWhenEmpty?: boolean;
};

const errorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message || fallback);
  }
  return fallback;
};

export const useCourseDirectorySelection = () => {
  const { show } = useToast();
  const [courseName, setCourseName] = useState("");
  const [results, setResults] = useState<CourseImportSearchResult[]>([]);
  const [attribution, setAttribution] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<CourseImportSearchResult | null>(null);
  const [preview, setPreview] = useState<ImportedCourse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const search = async ({ openWhenEmpty = false }: CourseDirectorySearchOptions = {}) => {
    const name = courseName.trim();
    if (name.length < 2) {
      show("Enter a course name.", "error");
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchCourseDirectory(name);
      setResults(response.results);
      setAttribution(response.attribution);
      setSelectedResult(null);
      setPreview(null);

      if (response.results.length === 0) {
        if (openWhenEmpty) {
          setIsOpen(true);
          show("No directory matches found. Enter the course location manually.", "info");
        } else {
          show("No matching courses were found. Try a shorter course name.", "error");
        }
        return;
      }
      setIsOpen(true);
    } catch (error) {
      show(errorMessage(error, "Course search failed."), "error");
    } finally {
      setIsSearching(false);
    }
  };

  const review = async (result: CourseImportSearchResult) => {
    setLoadingId(result.externalId);
    try {
      const importedCourse = await loadCourseImport(result.externalId);
      setSelectedResult(result);
      setPreview(importedCourse);
    } catch (error) {
      show(errorMessage(error, "Unable to load that course."), "error");
    } finally {
      setLoadingId(null);
    }
  };

  const close = () => {
    if (loadingId) return;
    setIsOpen(false);
    setSelectedResult(null);
    setPreview(null);
  };

  const reset = () => {
    if (loadingId) return;
    setIsOpen(false);
    setSelectedResult(null);
    setPreview(null);
    setResults([]);
    setAttribution("");
    setCourseName("");
  };

  const back = () => {
    if (loadingId) return;
    setSelectedResult(null);
    setPreview(null);
  };

  const confirm = async (
    action: (selection: CourseDirectorySelection) => Promise<void>,
    fallbackError: string,
  ) => {
    if (!preview || !selectedResult) return;

    setLoadingId("confirm");
    try {
      await action({ result: selectedResult, course: preview });
      setIsOpen(false);
      setSelectedResult(null);
      setPreview(null);
      setCourseName("");
    } catch (error) {
      show(errorMessage(error, fallbackError), "error");
    } finally {
      setLoadingId(null);
    }
  };

  return {
    courseName,
    setCourseName,
    results,
    attribution,
    isSearching,
    loadingId,
    preview,
    isOpen,
    search,
    review,
    close,
    reset,
    back,
    confirm,
  };
};
