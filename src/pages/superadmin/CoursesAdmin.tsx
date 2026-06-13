import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { Input, Select } from "@/components/form";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useClubs } from "@api/clubs";
import { useCreateClub } from "@api/clubs/mutations";
import { useCoursesWithTees, type CoursePayload, type CourseTeePayload } from "@api/courses";
import { useCreateCourse, useDeleteCourse, useUpdateCourse } from "@api/courses/mutations";
import { Flag, Plus, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

type CourseFormData = {
  clubId: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  accessType: string;
  numHoles: string;
  par: string;
};

type ClubFormData = {
  name: string;
  description: string;
  location: string;
  phone: string;
  link: string;
  accessType: string;
};

type HoleFormData = {
  num: number;
  par: string;
  dis: string;
  hcp: string;
};

type TeeFormData = {
  id?: number;
  name: string;
  color: string;
  distance: string;
  par: string;
  frontPar: string;
  backPar: string;
  slopeMen: string;
  slopeFrontMen: string;
  slopeBackMen: string;
  slopeWomen: string;
  slopeFrontWomen: string;
  slopeBackWomen: string;
  ratingMen: string;
  ratingFrontMen: string;
  ratingBackMen: string;
  ratingWomen: string;
  ratingFrontWomen: string;
  ratingBackWomen: string;
  holes: HoleFormData[];
};

type CourseRecord = {
  id: number;
  clubId?: number;
  name: string;
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  accessType?: string | null;
  numHoles?: number | null;
  par?: number | null;
  club?: { id?: number; name?: string | null; location?: string | null } | null;
  tees?: Array<{
    id?: number;
    name?: string | null;
    color?: string | null;
    distance?: number | null;
    par?: number | null;
    frontPar?: number | null;
    backPar?: number | null;
    slopeMen?: number | null;
    slopeFrontMen?: number | null;
    slopeBackMen?: number | null;
    slopeWomen?: number | null;
    slopeFrontWomen?: number | null;
    slopeBackWomen?: number | null;
    ratingMen?: number | null;
    ratingFrontMen?: number | null;
    ratingBackMen?: number | null;
    ratingWomen?: number | null;
    ratingFrontWomen?: number | null;
    ratingBackWomen?: number | null;
    holes?: HoleFormData[] | null;
  }> | null;
};

const emptyForm: CourseFormData = {
  clubId: "",
  name: "",
  description: "",
  location: "",
  phone: "",
  accessType: "public",
  numHoles: "18",
  par: "72",
};

const emptyClubForm: ClubFormData = {
  name: "",
  description: "",
  location: "",
  phone: "",
  link: "",
  accessType: "public",
};

const buildEmptyHoles = (count: number): HoleFormData[] =>
  Array.from({ length: count }, (_, index) => ({
    num: index + 1,
    par: "4",
    dis: "0",
    hcp: String(index + 1),
  }));

const buildEmptyTee = (count: number): TeeFormData => ({
  name: "",
  color: "",
  distance: "",
  par: count === 9 ? "36" : "72",
  frontPar: count === 9 ? "36" : "36",
  backPar: count === 9 ? "0" : "36",
  slopeMen: "",
  slopeFrontMen: "",
  slopeBackMen: count === 9 ? "0" : "",
  slopeWomen: "",
  slopeFrontWomen: "",
  slopeBackWomen: count === 9 ? "0" : "",
  ratingMen: "",
  ratingFrontMen: "",
  ratingBackMen: count === 9 ? "0" : "",
  ratingWomen: "",
  ratingFrontWomen: "",
  ratingBackWomen: count === 9 ? "0" : "",
  holes: buildEmptyHoles(count),
});

const ensureHoleCount = (holes: HoleFormData[], count: number) =>
  Array.from({ length: count }, (_, index) => ({
    num: index + 1,
    par: holes[index]?.par ?? "4",
    dis: holes[index]?.dis ?? "0",
    hcp: holes[index]?.hcp ?? String(index + 1),
  }));

const toNullableNumber = (value: string) => {
  if (value.trim() === "") return null;
  return Number(value);
};

export default function CoursesAdmin() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: clubs = [], isLoading: clubsLoading } = useClubs();
  const { data: courses = [] } = useCoursesWithTees();

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createClub = useCreateClub();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [clubForm, setClubForm] = useState<ClubFormData>(emptyClubForm);
  const [showClubForm, setShowClubForm] = useState(false);
  const [tees, setTees] = useState<TeeFormData[]>([]);

  const isSuperAdmin = String(user?.role || "").toUpperCase() === "SUPER";
  const holeCount = Number(form.numHoles) || 18;
  const editCourseId = Number(searchParams.get("edit") || 0);

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
    setForm(emptyForm);
    setTees([]);

    if (searchParams.get("edit")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("edit");
      setSearchParams(nextParams);
    }
  };

  const startEditing = (course: CourseRecord) => {
    const nextHoleCount = Number(course.numHoles || 18) || 18;

    setEditingId(Number(course.id));
    setForm({
      clubId: String(course.clubId ?? course.club?.id ?? ""),
      name: String(course.name || ""),
      description: String(course.description || ""),
      location: String(course.location || ""),
      phone: String(course.phone || ""),
      accessType: String(course.accessType || "public"),
      numHoles: String(nextHoleCount),
      par: String(course.par ?? 72),
    });
    setTees(
      Array.isArray(course.tees)
        ? course.tees.map((tee) => ({
            id: tee.id != null ? Number(tee.id) : undefined,
            name: String(tee.name || ""),
            color: String(tee.color || ""),
            distance: String(tee.distance ?? ""),
            par: String(tee.par ?? 0),
            frontPar: String(tee.frontPar ?? 0),
            backPar: String(tee.backPar ?? 0),
            slopeMen: String(tee.slopeMen ?? ""),
            slopeFrontMen: String(tee.slopeFrontMen ?? ""),
            slopeBackMen: String(tee.slopeBackMen ?? ""),
            slopeWomen: tee.slopeWomen == null ? "" : String(tee.slopeWomen),
            slopeFrontWomen: tee.slopeFrontWomen == null ? "" : String(tee.slopeFrontWomen),
            slopeBackWomen: tee.slopeBackWomen == null ? "" : String(tee.slopeBackWomen),
            ratingMen: String(tee.ratingMen ?? ""),
            ratingFrontMen: String(tee.ratingFrontMen ?? ""),
            ratingBackMen: String(tee.ratingBackMen ?? ""),
            ratingWomen: tee.ratingWomen == null ? "" : String(tee.ratingWomen),
            ratingFrontWomen: tee.ratingFrontWomen == null ? "" : String(tee.ratingFrontWomen),
            ratingBackWomen: tee.ratingBackWomen == null ? "" : String(tee.ratingBackWomen),
            holes: ensureHoleCount(
              Array.isArray(tee.holes)
                ? tee.holes.map((hole, index) => ({
                    num: Number(hole.num ?? index + 1),
                    par: String(hole.par ?? 4),
                    dis: String(hole.dis ?? 0),
                    hcp: String(hole.hcp ?? index + 1),
                  }))
                : [],
              nextHoleCount
            ),
          }))
        : []
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  useEffect(() => {
    if (!editCourseId || !Array.isArray(courses) || editingId === editCourseId) return;

    const courseToEdit = (courses as CourseRecord[]).find(
      (course) => Number(course.id) === editCourseId
    );
    if (courseToEdit) {
      startEditing(courseToEdit);
    }
  }, [courses, editCourseId, editingId]);

  const validate = () => {
    if (!form.clubId) {
      show("Please select a club.", "error");
      return false;
    }

    if (!form.name.trim()) {
      show("Course name is required.", "error");
      return false;
    }

    const coursePar = Number(form.par);
    if (Number.isNaN(coursePar) || coursePar <= 0) {
      show("Par must be a positive number.", "error");
      return false;
    }

    const holes = Number(form.numHoles);
    if (!holes || Number.isNaN(holes) || holes <= 0) {
      show("Number of holes must be a positive number.", "error");
      return false;
    }

    for (const [teeIndex, tee] of tees.entries()) {
      if (!tee.name.trim()) {
        show(`Tee ${teeIndex + 1} needs a name.`, "error");
        return false;
      }

      if (!tee.color.trim()) {
        show(`Tee ${teeIndex + 1} needs a color.`, "error");
        return false;
      }

      if (tee.holes.length !== holes) {
        show(`Tee ${teeIndex + 1} must have ${holes} holes.`, "error");
        return false;
      }

      for (const hole of tee.holes) {
        if (Number.isNaN(Number(hole.par)) || Number(hole.par) <= 0) {
          show(`Hole ${hole.num} on tee ${teeIndex + 1} needs a valid par.`, "error");
          return false;
        }

        if (Number.isNaN(Number(hole.dis)) || Number(hole.dis) < 0) {
          show(`Hole ${hole.num} on tee ${teeIndex + 1} needs a valid distance.`, "error");
          return false;
        }

        if (Number.isNaN(Number(hole.hcp)) || Number(hole.hcp) <= 0) {
          show(`Hole ${hole.num} on tee ${teeIndex + 1} needs a valid handicap rank.`, "error");
          return false;
        }
      }
    }

    return true;
  };

  const mapTeePayload = (tee: TeeFormData): CourseTeePayload => ({
    ...(tee.id != null ? { id: tee.id } : {}),
    name: tee.name.trim(),
    color: tee.color.trim(),
    distance: Number(tee.distance || 0),
    par: Number(tee.par || 0),
    frontPar: Number(tee.frontPar || 0),
    backPar: Number(tee.backPar || 0),
    slopeMen: Number(tee.slopeMen || 0),
    slopeFrontMen: Number(tee.slopeFrontMen || 0),
    slopeBackMen: Number(tee.slopeBackMen || 0),
    slopeWomen: toNullableNumber(tee.slopeWomen),
    slopeFrontWomen: toNullableNumber(tee.slopeFrontWomen),
    slopeBackWomen: toNullableNumber(tee.slopeBackWomen),
    ratingMen: Number(tee.ratingMen || 0),
    ratingFrontMen: Number(tee.ratingFrontMen || 0),
    ratingBackMen: Number(tee.ratingBackMen || 0),
    ratingWomen: toNullableNumber(tee.ratingWomen),
    ratingFrontWomen: toNullableNumber(tee.ratingFrontWomen),
    ratingBackWomen: toNullableNumber(tee.ratingBackWomen),
    holes: tee.holes.map((hole) => ({
      num: hole.num,
      par: Number(hole.par),
      dis: Number(hole.dis),
      hcp: Number(hole.hcp),
    })),
  });

  const toPayload = (): CoursePayload => ({
    clubId: Number(form.clubId),
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    location: form.location.trim() || undefined,
    phone: form.phone.trim() || undefined,
    accessType: form.accessType || "public",
    numHoles: form.numHoles ? Number(form.numHoles) : undefined,
    par: Number(form.par),
    tees: tees.map(mapTeePayload),
  });

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = toPayload();

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
        icon={<ShieldCheck size={14} />}
        iconText="SUPER ADMIN"
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
              <button
                type="button"
                className="btn btn-outline btn-sm border-slate-300 bg-white"
                onClick={addTee}
              >
                <Plus size={14} /> Add Tee
              </button>
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={() => handleDeleteCourse(editingId!)}
                disabled={!editingId}
              >
                Delete Course
              </button>
            </div>
          </div>

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
              <button
                type="button"
                className="btn btn-outline btn-sm border-slate-300 bg-white"
                onClick={() => setShowClubForm((prev) => !prev)}
              >
                <Plus size={14} /> {showClubForm ? "Hide Club Form" : "Add New Club"}
              </button>
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
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateClub}
                    disabled={createClub.isPending}
                  >
                    {createClub.isPending ? "Creating Club..." : "Create Club"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setClubForm(emptyClubForm);
                      setShowClubForm(false);
                    }}
                    disabled={createClub.isPending}
                  >
                    Cancel
                  </button>
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
            <button type="button" className="btn btn-primary btn-sm" onClick={addTee}>
              <Plus size={14} /> Add Another Tee
            </button>
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
                key={`${teeIndex}-${tee.name}`}
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
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => removeTee(teeIndex)}
                    >
                      Remove Tee
                    </button>
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
          <button
            type="button"
            className="btn btn-primary btn-sm"
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
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ScorecardInputTable({
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
  onHoleChange: (
    teeIndex: number,
    holeIndex: number,
    field: keyof HoleFormData,
    value: string
  ) => void;
}) {
  if (holes.length === 0) return null;

  const totalDistance = holes.reduce((sum, hole) => sum + Number(hole.dis || 0), 0);
  const totalPar = holes.reduce((sum, hole) => sum + Number(hole.par || 0), 0);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="table table-xs min-w-[820px] border-separate border-spacing-0 bg-white">
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
          <ScorecardInputRow
            label="Yards"
            holes={holes}
            total={String(totalDistance)}
            inputType="number"
            field="dis"
            teeIndex={teeIndex}
            startIndex={startIndex}
            onHoleChange={onHoleChange}
          />
          <ScorecardInputRow
            label="Par"
            holes={holes}
            total={String(totalPar)}
            inputType="number"
            field="par"
            teeIndex={teeIndex}
            startIndex={startIndex}
            onHoleChange={onHoleChange}
          />
          <ScorecardInputRow
            label="HCP"
            holes={holes}
            total="—"
            inputType="number"
            field="hcp"
            teeIndex={teeIndex}
            startIndex={startIndex}
            onHoleChange={onHoleChange}
          />
        </tbody>
      </table>
    </div>
  );
}

function ScorecardInputRow({
  label,
  holes,
  total,
  inputType,
  field,
  teeIndex,
  startIndex,
  onHoleChange,
}: {
  label: string;
  holes: HoleFormData[];
  total: string;
  inputType: string;
  field: keyof Pick<HoleFormData, "dis" | "par" | "hcp">;
  teeIndex: number;
  startIndex: number;
  onHoleChange: (
    teeIndex: number,
    holeIndex: number,
    field: keyof HoleFormData,
    value: string
  ) => void;
}) {
  return (
    <tr className="border-t border-slate-200 text-sm text-slate-700">
      <th
        scope="row"
        className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"
      >
        {label}
      </th>
      {holes.map((hole, holeOffset) => (
        <td key={`${label}-${hole.num}`} className="px-1.5 py-1.5">
          <input
            type={inputType}
            value={String(hole[field] ?? "")}
            onChange={(e) => onHoleChange(teeIndex, startIndex + holeOffset, field, e.target.value)}
            className="input input-bordered input-xs h-8 w-16 min-w-0 border-slate-200 bg-white px-1 text-center text-[11px]"
            aria-label={`${label} for hole ${hole.num}`}
          />
        </td>
      ))}
      <td className="px-2.5 py-2 text-center text-xs font-semibold text-slate-900">{total}</td>
    </tr>
  );
}
