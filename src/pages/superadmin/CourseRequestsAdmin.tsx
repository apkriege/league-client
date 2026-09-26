import { Link } from "react-router";
import { Check, Clock3, ExternalLink, MapPin } from "lucide-react";
import type { CourseRequest } from "@api/courses";
import { usePendingCourseRequests } from "@api/courses/queries";
import { useResolveCourseRequest } from "@api/courses/mutations";
import Button from "@/components/layout/Button";
import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table, { type Column } from "@/components/Table";
import { useToast } from "@/context/useToast";
import { getApiErrorMessage } from "@/lib/apiError";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );

export default function CourseRequestsAdmin() {
  const { data: requests = [], isLoading, isError, error } = usePendingCourseRequests();
  const resolveRequest = useResolveCourseRequest();
  const { show } = useToast();

  if (isLoading) return <LoadingState>Loading course requests...</LoadingState>;
  if (isError) {
    return (
      <PageState
        title="Unable to Load Course Requests"
        message={getApiErrorMessage(error, "The requested courses could not be loaded right now.")}
        variant="error"
      />
    );
  }

  const columns: Column<CourseRequest>[] = [
    {
      key: "courseName",
      label: "Course",
      render: (value, row) => (
        <div>
          <p className="font-bold text-slate-900">{String(value)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} aria-hidden="true" /> {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "requestType",
      label: "Source",
      width: "120px",
      render: (value) => (
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
          {String(value)}
        </span>
      ),
    },
    {
      key: "requester",
      label: "Requested By",
      render: (_value, row) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.requester.firstName} {row.requester.lastName}
          </p>
          <p className="text-xs text-slate-500">{row.requester.email}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Requested",
      width: "180px",
      render: (value) => (
        <span className="tabular-nums text-xs text-slate-600">{formatDate(String(value))}</span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      width: "240px",
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to="/superadmin/courses"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Add course <ExternalLink size={13} aria-hidden="true" />
          </Link>
          <Button
            type="button"
            variant="secondary"
            disabled={resolveRequest.isPending}
            onClick={() =>
              resolveRequest.mutate(row.id, {
                onSuccess: () => show("Course request completed.", "success"),
                onError: () => show("Unable to complete course request.", "error"),
              })
            }
          >
            <Check size={14} /> Done
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Course Requests"
        subTitle="Review courses submitted by league admins and clear each request after the course is added."
      />
      <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
            <Clock3 size={18} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Pending requests
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums">{requests.length}</p>
          </div>
        </div>
      </div>
      <Table
        data={requests}
        columns={columns}
        heading="Requested Courses"
        searchPlaceholder="Search course, location, or requester..."
        pageSize={25}
      />
    </div>
  );
}
