import Button from "@/components/layout/Button";
import { useMemo, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { Input, Select } from "@/components/form";
import Card from "@/components/layout/Card";
import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/context/useToast";
import { useClubs } from "@api/clubs";
import { useCreateClub } from "@api/clubs/mutations";
import { useCoursesWithTees } from "@api/courses";
import { useCreateCourse, useDeleteCourse, useUpdateCourse } from "@api/courses/mutations";
import type { ImportedCourse } from "@api/courses";
import { AlertTriangle, Flag, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import {
  buildEmptyTee,
  courseToEditorState,
  emptyClubForm,
  emptyCourseForm,
  ensureHoleCount,
  getCourseValidationError,
  toCoursePayload,
  type ClubFormData,
  type CourseFormData,
  type CourseRecord,
  type HoleFormData,
  type TeeFormData,
} from "./courseAdminForm";
import ScorecardInputTable from "./components/ScorecardInputTable";
import CourseImportSearch from "./components/CourseImportSearch";

export default function CoursesAdmin() {
  const [searchParams] = useSearchParams();
  const { data: courses = [], isLoading } = useCoursesWithTees();
  const editCourseId = Number(searchParams.get("edit") || 0);
  const initialCourse = (courses as CourseRecord[]).find(
    (course) => Number(course.id) === editCourseId,
  );

  if (editCourseId && isLoading) {
    return <LoadingState>Loading course...</LoadingState>;
  }

  return (
    <CoursesAdminEditor
      key={editCourseId || "new-course"}
      initialCourse={initialCourse}
    />
  );
}

function CoursesAdminEditor({ initialCourse }: { initialCourse?: CourseRecord }) {
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: clubs = [], isLoading: clubsLoading } = useClubs();

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createClub = useCreateClub();

  const initialEditorState = initialCourse ? courseToEditorState(initialCourse) : null;
  const [editingId, setEditingId] = useState<number | null>(
    initialCourse ? Number(initialCourse.id) : null,
  );
  const [form, setForm] = useState<CourseFormData>(initialEditorState?.form ?? emptyCourseForm);
  const [clubForm, setClubForm] = useState<ClubFormData>(emptyClubForm);
  const [showClubForm, setShowClubForm] = useState(false);
  const [tees, setTees] = useState<TeeFormData[]>(initialEditorState?.tees ?? []);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importAttribution, setImportAttribution] = useState("");

  const isSuperAdmin = String(user?.role || "").toUpperCase() === "SUPER";
  const holeCount = Number(form.numHoles) || 18;

  const clubOptions = useMemo(
    () =>
      clubs.map((club: any) => ({
        value: String(club.id),
        label: club.name,
      })),
    [clubs]
  );

  const handleChange = (field: keyof CourseFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "numHoles") {
      const nextCount = Number(value) || 18;
      setTees((prev) =>
        prev.map((tee) => ({
          ...tee,
          holes: ensureHoleCount(tee.holes, nextCount),
          holesWomen: ensureHoleCount(tee.holesWomen, nextCount),
        }))
      );
    }
  };

  const handleClubChange = (field: keyof ClubFormData, value: string) => {
    setClubForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTeeChange = (teeIndex: number, field: keyof TeeFormData, value: string) => {
    setTees((prev) =>
      prev.map((tee, index) => (index === teeIndex ? { ...tee, [field]: value } : tee))
    );
  };

  const handleHoleChange = (
    teeIndex: number,
    holeIndex: number,
    field: keyof HoleFormData,
    value: string
  ) => {
    setTees((prev) =>
      prev.map((tee, index) => {
        if (index !== teeIndex) return tee;

        return {
          ...tee,
          holes: tee.holes.map((hole, currentIndex) =>
            currentIndex === holeIndex ? { ...hole, [field]: value } : hole
          ),
        };
      })
    );
  };

  const addTee = () => {
    setTees((prev) => [...prev, buildEmptyTee(holeCount)]);
  };

  const removeTee = (teeIndex: number) => {
    setTees((prev) => prev.filter((_, index) => index !== teeIndex));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCourseForm);
    setTees([]);
    setImportWarnings([]);
    setImportAttribution("");

    if (searchParams.get("edit")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("edit");
      setSearchParams(nextParams);
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    deleteCourse.mutate(Number(courseId), {
      onSuccess: () => {
        if (editingId === Number(courseId)) {
          resetForm();
        }
        show("Course deleted.", "success");
      },
      onError: () => show("Failed to delete course.", "error"),
    });
  };

  const handleCreateClub = () => {
    const name = clubForm.name.trim();
    if (!name) {
      show("Club name is required.", "error");
      return;
    }

    createClub.mutate(
      {
        name,
        description: clubForm.description.trim(),
        location: clubForm.location.trim(),
        phone: clubForm.phone.trim(),
        link: clubForm.link.trim(),
        accessType: clubForm.accessType,
      },
      {
        onSuccess: (club: any) => {
          setForm((prev) => ({ ...prev, clubId: String(club.id) }));
          setClubForm(emptyClubForm);
          setShowClubForm(false);
          show("Club created. You can now add courses to it.", "success");
        },
        onError: () => show("Failed to create club.", "error"),
      }
    );
  };

  const handleCourseImport = async (imported: ImportedCourse) => {
    const normalizedClubName = imported.club.name.trim().toLowerCase();
    const importedCity = imported.course.location.split(",")[0]?.trim().toLowerCase();
    const existingClub = clubs.find(
      (club: any) => {
        const sameName = String(club.name || "").trim().toLowerCase() === normalizedClubName;
        const clubLocation = String(club.location || "").trim().toLowerCase();
        return sameName && (!clubLocation || !importedCity || clubLocation.includes(importedCity));
      }
    );
    const club =
      existingClub ??
      (await createClub.mutateAsync({
        name: imported.club.name,
        description: imported.club.description,
        location: imported.club.location,
        phone: imported.club.phone,
        link: imported.club.link,
        accessType: imported.club.accessType,
      }));
    const editorState = courseToEditorState({
      id: 0,
      clubId: Number(club.id),
      ...imported.course,
    });

    setEditingId(null);
    setForm(editorState.form);
    setTees(editorState.tees);
    setImportWarnings(imported.warnings);
    setImportAttribution(imported.attribution);
    setClubForm(emptyClubForm);
    setShowClubForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (imported.warnings.length > 0) {
      show(
        `Course loaded with ${imported.warnings.length} warning${
          imported.warnings.length === 1 ? "" : "s"
        }. Review the imported scorecard before saving.`,
        "warning"
      );
    } else {
      show("Club confirmed and course data loaded for review.", "success");
    }
  };

  const handleSubmit = () => {
    const validationError = getCourseValidationError(form, tees);
    if (validationError) {
      show(validationError, "error");
      return;
    }

    const payload = toCoursePayload(form, tees);

    if (editingId) {
      updateCourse.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            show("Course updated.", "success");
            resetForm();
            navigate("/courses");
          },
          onError: () => show("Failed to update course.", "error"),
        }
      );
      return;
    }

    createCourse.mutate(payload, {
      onSuccess: () => {
        show("Course created.", "success");
        resetForm();
        navigate("/courses");
      },
      onError: () => show("Failed to create course.", "error"),
    });
  };

  if (!isSuperAdmin) {
    return (
      <Card className="max-w-xl mt-6">
        <p className="text-sm font-semibold">Super Admin Only</p>
        <p className="text-xs text-gray-500 mt-1">You do not have access to manage courses.</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Course Management"
        subTitle="Create courses, attach multiple tees, and manage hole-by-hole rating data."
      />

      <Card className="mt-6 border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))] px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                {editingId ? "Edit Course" : "Create Course"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {editingId ? "Refine course details" : "Build a clean course record"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep the base course information simple here, then add tee-specific ratings and hole
                data below.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[280px]">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Club
                </p>
                <p className="mt-2 text-lg font-semibold leading-none text-slate-900">
                  {clubOptions.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">linked options</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Holes
                </p>
                <p className="mt-2 text-lg font-semibold leading-none text-slate-900">
                  {holeCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">current layout</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Tees
                </p>
                <p className="mt-2 text-lg font-semibold leading-none text-slate-900">
                  {tees.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">configured</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Course Details
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Primary information used across the public and admin views.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="primary"
                outline
                size="sm"
                onClick={addTee}
              >
                <Plus size={14} /> Add Tee
              </Button>
              <Button
                type="button"
                variant="error"
                size="sm"
                onClick={() => handleDeleteCourse(editingId!)}
                disabled={!editingId}
              >
                Delete Course
              </Button>
            </div>
          </div>

          {!editingId && (
            <CourseImportSearch
              disabled={createClub.isPending}
              onImport={handleCourseImport}
            />
          )}

          {importWarnings.length > 0 && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={16} />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Review the imported course data
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">
                    {importWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                  {importAttribution && (
                    <p className="mt-3 text-xs text-amber-700">{importAttribution}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Club Setup
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Create a club first, then assign one or more courses to it.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                outline
                size="sm"
                onClick={() => setShowClubForm((prev) => !prev)}
              >
                <Plus size={14} /> {showClubForm ? "Hide Club Form" : "Add New Club"}
              </Button>
            </div>

            {showClubForm && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                  <Input
                    dense
                    label="Club Name"
                    value={clubForm.name}
                    onChange={(e) => handleClubChange("name", e.target.value)}
                  />
                  <Input
                    dense
                    label="Location"
                    value={clubForm.location}
                    onChange={(e) => handleClubChange("location", e.target.value)}
                  />
                  <Input
                    dense
                    label="Phone"
                    value={clubForm.phone}
                    onChange={(e) => handleClubChange("phone", e.target.value)}
                  />
                  <Input
                    dense
                    label="Website"
                    value={clubForm.link}
                    onChange={(e) => handleClubChange("link", e.target.value)}
                  />
                  <Input
                    dense
                    label="Description"
                    className="md:col-span-2"
                    value={clubForm.description}
                    onChange={(e) => handleClubChange("description", e.target.value)}
                  />
                  <Select
                    dense
                    label="Access"
                    value={clubForm.accessType}
                    options={[
                      { value: "public", label: "Public" },
                      { value: "private", label: "Private" },
                    ]}
                    onChange={(e) => handleClubChange("accessType", e.target.value)}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleCreateClub}
                    disabled={createClub.isPending}
                  >
                    {createClub.isPending ? "Creating Club..." : "Create Club"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setClubForm(emptyClubForm);
                      setShowClubForm(false);
                    }}
                    disabled={createClub.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            <Select
              dense
              label="Club"
              value={form.clubId}
              options={clubOptions}
              placeholder={clubsLoading ? "Loading clubs..." : "Select club"}
              onChange={(e) => handleChange("clubId", e.target.value)}
            />
            <Input
              dense
              label="Course Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Input
              dense
              label="Par"
              type="number"
              value={form.par}
              onChange={(e) => handleChange("par", e.target.value)}
            />
            <Input
              dense
              label="Num Holes"
              type="number"
              value={form.numHoles}
              onChange={(e) => handleChange("numHoles", e.target.value)}
            />
            <Input
              dense
              label="Location"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
            <Input
              dense
              label="Phone"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input
              dense
              label="IANA Timezone"
              placeholder="America/Detroit"
              value={form.timeZone}
              onChange={(e) => handleChange("timeZone", e.target.value)}
            />
            <Input
              dense
              label="Description"
              className="md:col-span-2"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <Select
              dense
              label="Access"
              value={form.accessType}
              options={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
              ]}
              onChange={(e) => handleChange("accessType", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Tee Configuration
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Each tee holds its own pars, ratings, slopes, and hole-by-hole setup.
              </p>
            </div>
            <Button type="button" variant="primary" onClick={addTee}>
              <Plus size={14} /> Add Another Tee
            </Button>
          </div>

          {tees.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-base font-medium text-slate-900">No tees added yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start with one tee, then capture rating and scorecard data in a consistent format.
              </p>
            </div>
          ) : (
            tees.map((tee, teeIndex) => (
              <section
                key={tee.id ?? `new-tee-${teeIndex}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600">
                        <Flag size={14} />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {tee.name.trim() || `Tee ${teeIndex + 1}`}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Tee Setup
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="error"
                      outline
                      onClick={() => removeTee(teeIndex)}
                      aria-label={`Remove ${tee.name.trim() || `tee ${teeIndex + 1}`}`}
                    >
                      <Trash2 size={14} />
                      Remove Tee
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5">
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-6">
                    <Input
                      dense
                      label="Tee Name"
                      value={tee.name}
                      onChange={(e) => handleTeeChange(teeIndex, "name", e.target.value)}
                    />
                    <Input
                      dense
                      label="Color"
                      value={tee.color}
                      onChange={(e) => handleTeeChange(teeIndex, "color", e.target.value)}
                    />
                    <Input
                      dense
                      label="Distance"
                      type="number"
                      value={tee.distance}
                      onChange={(e) => handleTeeChange(teeIndex, "distance", e.target.value)}
                    />
                    <Input
                      dense
                      label="Par"
                      type="number"
                      value={tee.par}
                      onChange={(e) => handleTeeChange(teeIndex, "par", e.target.value)}
                    />
                    <Input
                      dense
                      label="Front Par"
                      type="number"
                      value={tee.frontPar}
                      onChange={(e) => handleTeeChange(teeIndex, "frontPar", e.target.value)}
                    />
                    <Input
                      dense
                      label="Back Par"
                      type="number"
                      value={tee.backPar}
                      onChange={(e) => handleTeeChange(teeIndex, "backPar", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Men Rating / Slope
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
                        <Input
                          dense
                          label="Slope"
                          type="number"
                          value={tee.slopeMen}
                          onChange={(e) => handleTeeChange(teeIndex, "slopeMen", e.target.value)}
                        />
                        <Input
                          dense
                          label="Front Slope"
                          type="number"
                          value={tee.slopeFrontMen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "slopeFrontMen", e.target.value)
                          }
                        />
                        <Input
                          dense
                          label="Back Slope"
                          type="number"
                          value={tee.slopeBackMen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "slopeBackMen", e.target.value)
                          }
                        />
                        <Input
                          dense
                          label="Rating"
                          type="number"
                          step="0.1"
                          value={tee.ratingMen}
                          onChange={(e) => handleTeeChange(teeIndex, "ratingMen", e.target.value)}
                        />
                        <Input
                          dense
                          label="Front Rating"
                          type="number"
                          step="0.1"
                          value={tee.ratingFrontMen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "ratingFrontMen", e.target.value)
                          }
                        />
                        <Input
                          dense
                          label="Back Rating"
                          type="number"
                          step="0.1"
                          value={tee.ratingBackMen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "ratingBackMen", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Women Rating / Slope
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
                        <Input
                          dense
                          label="Slope"
                          type="number"
                          value={tee.slopeWomen}
                          onChange={(e) => handleTeeChange(teeIndex, "slopeWomen", e.target.value)}
                        />
                        <Input
                          dense
                          label="Front Slope"
                          type="number"
                          value={tee.slopeFrontWomen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "slopeFrontWomen", e.target.value)
                          }
                        />
                        <Input
                          dense
                          label="Back Slope"
                          type="number"
                          value={tee.slopeBackWomen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "slopeBackWomen", e.target.value)
                          }
                        />
                        <Input
                          dense
                          label="Rating"
                          type="number"
                          step="0.1"
                          value={tee.ratingWomen}
                          onChange={(e) => handleTeeChange(teeIndex, "ratingWomen", e.target.value)}
                        />
                        <Input
                          dense
                          label="Front Rating"
                          type="number"
                          step="0.1"
                          value={tee.ratingFrontWomen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "ratingFrontWomen", e.target.value)
                          }
                        />
                        <Input
                          dense
                          label="Back Rating"
                          type="number"
                          step="0.1"
                          value={tee.ratingBackWomen}
                          onChange={(e) =>
                            handleTeeChange(teeIndex, "ratingBackWomen", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Hole Setup
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Enter distance, par, and handicap in a scorecard layout.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ScorecardInputTable
                        title={holeCount > 9 ? "Front 9" : "Scorecard"}
                        holes={tee.holes.slice(0, Math.min(9, tee.holes.length))}
                        teeIndex={teeIndex}
                        startIndex={0}
                        onHoleChange={handleHoleChange}
                      />

                      {tee.holes.length > 9 && (
                        <ScorecardInputTable
                          title="Back 9"
                          holes={tee.holes.slice(9, 18)}
                          teeIndex={teeIndex}
                          startIndex={9}
                          onHoleChange={handleHoleChange}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ))
          )}
        </div>

        <div className="mt-6 flex gap-2 border-t border-slate-200 pt-5">
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={createCourse.isPending || updateCourse.isPending}
          >
            {editingId
              ? updateCourse.isPending
                ? "Updating..."
                : "Update Course"
              : createCourse.isPending
                ? "Creating..."
                : "Create Course"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
