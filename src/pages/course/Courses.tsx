import Table, { type Column } from "@/components/Table";
import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/appStore";
import { useCoursesWithTees } from "@api/courses/queries";
import { BookOpen, Flag, MapPin, Trees, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import CourseRequestPanel from "./components/CourseRequestPanel";
import Button from "@/components/layout/Button";
import Chip from "@mui/material/Chip";

type CourseRow = {
  id: number;
  name: string;
  club: string;
  city: string;
  state: string;
  access: string;
  holes: number;
  par: number;
  tees: number;
};

const getCityAndState = (location: string | null | undefined) => {
  const parts = String(location || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return { city: parts[0] || "—", state: "—" };
  }

  return {
    city: parts.at(-2) || "—",
    state: parts.at(-1)?.replace(/\s+\d{5}(?:-\d{4})?$/, "") || "—",
  };
};

export default function Courses() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { data: courses = [], isLoading } = useCoursesWithTees();
  const role = String(user?.role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER";
  const canRequestCourse = role === "ADMIN" || isSuperAdmin;

  const rows = useMemo<CourseRow[]>(
    () =>
      courses
        .map((course: any) => {
          const location = getCityAndState(course.location || course.club?.location);

          return {
            id: Number(course.id),
            name: course.name,
            club: course.club?.name || "—",
            city: location.city,
            state: location.state,
            access: course.accessType || "public",
            holes: Number(course.numHoles || 0),
            par: Number(course.par || 0),
            tees: Array.isArray(course.tees) ? course.tees.length : 0,
          };
        })
        .sort((a: any, b: any) => {
          const clubCmp = a.club.localeCompare(b.club);
          return clubCmp !== 0 ? clubCmp : a.name.localeCompare(b.name);
        }),
    [courses]
  );

  const columns: Column<CourseRow>[] = [
    {
      key: "name",
      label: "Course",
      render: (value) => <p className="text-sm font-semibold text-gray-900">{value}</p>,
      // cellWidth: "28%",
    },
    {
      key: "club",
      label: "Club",
      render: (value) => <p className="text-xs text-gray-700">{value}</p>,
      // cellWidth: "25%",
    },
    {
      key: "city",
      label: "City",
      render: (value) => <p className="text-xs text-gray-700">{value}</p>,
    },
    {
      key: "state",
      label: "State",
      render: (value) => <p className="text-xs text-gray-700">{value}</p>,
    },
    {
      key: "holes",
      label: "Layout",
      render: (_, row) => (
        <span className="text-xs font-medium text-gray-700">
          {row.holes} holes · Par {row.par}
        </span>
      ),
      // cellWidth: "16%",
    },
    {
      key: "tees",
      label: "Tees",
      render: (value) => <Chip label={value} color="primary" size="small" />,
      cellWidth: "7%",
    },
    {
      key: "access",
      label: "Access",
      render: (value) => (
        <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-500">
          {value}
        </span>
      ),
      cellWidth: "7%",
    },
    ...(isSuperAdmin
      ? [
          {
            key: "id" as keyof CourseRow,
            label: "Edit",
            render: (_value: unknown, row: CourseRow) => (
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/superadmin/courses?edit=${row.id}`);
                }}
              >
                Edit
              </Button>
            ),
            cellWidth: "10%",
          } satisfies Column<CourseRow>,
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Courses"
        subTitle="Browse every course in the system, search by club or location, and open full course details."
      />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Courses",
            value: rows.length,
            sub: "available to browse",
            icon: <BookOpen size={14} className="text-slate-900" />,
            bg: "bg-slate-900/5 border-slate-900/10",
          },
          {
            label: "Clubs",
            value: new Set(rows.map((row) => row.club)).size,
            sub: "with linked courses",
            icon: <Trees size={14} className="text-emerald-500" />,
            bg: "bg-emerald-50 border-emerald-100",
          },
          {
            label: "Tees",
            value: rows.reduce((sum, row) => sum + row.tees, 0),
            sub: "configured layouts",
            icon: <Flag size={14} className="text-amber-500" />,
            bg: "bg-amber-50 border-amber-100",
          },
          {
            label: "Average Par",
            value: rows.length
              ? (rows.reduce((sum, row) => sum + row.par, 0) / rows.length).toFixed(1)
              : "0",
            sub: "across all courses",
            icon: <Trophy size={14} className="text-blue-500" />,
            bg: "bg-blue-50 border-blue-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xs flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg border ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-gray-800 leading-tight">{stat.value}</p>
              <p className="text-[10px] text-gray-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {canRequestCourse && <CourseRequestPanel />}

      {isLoading ? (
        <Card>
          <p className="text-sm text-gray-500">Loading courses...</p>
        </Card>
      ) : (
        <Table
          data={rows}
          columns={columns}
          heading="Course Directory"
          pagination
          pageSize={10}
          onRowClick={(row) => navigate(`/courses/${row.id}`)}
          headerActions={
            <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 pr-2">
              <MapPin size={12} />
              <span>
                {isSuperAdmin ? "Click row to open or use Edit" : "Click any row to open"}
              </span>
            </div>
          }
        />
      )}
    </div>
  );
}
