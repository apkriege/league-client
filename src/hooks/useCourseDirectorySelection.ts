import { useState } from "react";
import { useToast } from "@/context/useToast";
import {
  loadCourseImport,
  searchCourseDirectory,
  searchStateCourseDirectory,
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
  const [state, setState] = useState("");
  const [stateOffset, setStateOffset] = useState(0);
  const [hasMoreStateResults, setHasMoreStateResults] = useState(false);
  const [stateSummary, setStateSummary] = useState("");
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
      const response = await searchCourseDirectory(name, state.trim());
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

  const searchState = async (offset = 0) => {
    const stateCode = state.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(stateCode)) {
      show("Enter a two-letter state code.", "error");
      return;
    }
    setIsSearching(true);
    try {
      const response = await searchStateCourseDirectory(stateCode, offset);
      setResults(response.results);
      setAttribution(response.attribution);
      setStateOffset(response.nextOffset);
      setHasMoreStateResults(response.hasMore);
      setStateSummary(
        `${response.results.length} courses shown · availability is checked when selected`,
      );
      setSelectedResult(null);
      setPreview(null);
      setIsOpen(true);
    } catch (error) {
      show(errorMessage(error, "State course search failed."), "error");
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
    setState("");
    setStateOffset(0);
    setHasMoreStateResults(false);
    setStateSummary("");
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
    state,
    setState,
    stateOffset,
    hasMoreStateResults,
    stateSummary,
    results,
    attribution,
    isSearching,
    loadingId,
    preview,
    isOpen,
    search,
    searchState,
    review,
    close,
    reset,
    back,
    confirm,
  };
};
