import { Link } from "react-router";
import { useState } from "react";
import { Check, Clock3, ExternalLink, MapPin } from "lucide-react";
import type { CourseRequest } from "@api/courses";
import { useCoursesWithTees, usePendingCourseRequests } from "@api/courses/queries";
import { useResolveCourseRequest, useRetryCourseRequestNotification } from "@api/courses/mutations";
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
  const retryNotification = useRetryCourseRequestNotification();
  const { data: courses = [] } = useCoursesWithTees();
  const [selectedCourseId, setSelectedCourseId] = useState<Record<number, string>>({});
  const [unavailableReason, setUnavailableReason] = useState<Record<number, string>>({});
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

  const renderActions = (row: CourseRequest) => (
    <div className="flex flex-col gap-2">
      {row.status !== "pending" ? (
        <>
          <p className="text-xs font-bold text-amber-700">{row.status} · requester email {row.notificationStatus}</p>
          <Button type="button" variant="secondary" disabled={retryNotification.isPending}
            onClick={() => retryNotification.mutate(row.id, {
              onSuccess: (result) => show(result.notificationStatus === "sent" ? "Requester notified." : "Notification still needs attention.", result.notificationStatus === "sent" ? "success" : "warning"),
              onError: () => show("Unable to retry notification.", "error"),
            })}>Retry email</Button>
        </>
      ) : <>
      <Link
        to="/superadmin/courses"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        Add course <ExternalLink size={13} aria-hidden="true" />
      </Link>
      <label className="text-xs font-bold text-slate-700">Link added course</label>
      <select aria-label={`Course to fulfill ${row.courseName}`} value={selectedCourseId[row.id] || ""}
        onChange={(event) => setSelectedCourseId((current) => ({ ...current, [row.id]: event.target.value }))}
        className="min-h-10 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
        <option value="">Select course</option>
        {(courses as Array<{ id: number; name: string; location?: string; externalId?: string | null }>).map((course) => (
          <option key={course.id} value={course.id} disabled={Boolean(row.externalId && row.externalId !== course.externalId)}>
            {course.name} · {course.location || "Location unavailable"} (#{course.id})
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="secondary"
        disabled={resolveRequest.isPending || !selectedCourseId[row.id]}
        onClick={() => resolveRequest.mutate({ id: row.id, action: "fulfill", courseId: Number(selectedCourseId[row.id]) }, {
          onSuccess: (result) => show(result.notificationStatus === "sent" ? "Course linked and requester notified." : "Course linked; requester email needs attention.", result.notificationStatus === "sent" ? "success" : "warning"),
          onError: (error) => show(getApiErrorMessage(error, "Unable to fulfill course request."), "error"),
        })}
      >
        <Check size={14} /> Fulfill
      </Button>
      <input aria-label={`Reason ${row.courseName} cannot be added`} placeholder="Reason if unavailable" value={unavailableReason[row.id] || ""}
        onChange={(event) => setUnavailableReason((current) => ({ ...current, [row.id]: event.target.value }))}
        className="min-h-10 rounded-xl border border-slate-200 px-3 text-sm" maxLength={500} />
      <Button type="button" variant="secondary" disabled={resolveRequest.isPending || (unavailableReason[row.id] || "").trim().length < 5}
        onClick={() => resolveRequest.mutate({ id: row.id, action: "unavailable", reason: unavailableReason[row.id]?.trim() }, {
          onSuccess: (result) => show(result.notificationStatus === "sent" ? "Requester notified." : "Request closed; requester email needs attention.", result.notificationStatus === "sent" ? "success" : "warning"),
          onError: (error) => show(getApiErrorMessage(error, "Unable to close request."), "error"),
        })}>Cannot add</Button>
      </>}
    </div>
  );

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
      render: (_value, row) => renderActions(row),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Course Requests"
        subTitle="Link each request to an existing course or explain why it cannot be added."
      />
      <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
            <Clock3 size={18} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Requests needing attention
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
        renderMobileCard={(row) => (
          <div className="space-y-3">
            <div>
              <p className="break-words font-black text-slate-900">{row.courseName}</p>
              <p className="mt-1 flex items-start gap-1 text-sm text-slate-500"><MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{row.location}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1 font-bold capitalize text-slate-700">{row.requestType}</span>
              <span>{formatDate(row.createdAt)}</span>
            </div>
            <p className="break-all text-xs text-slate-500">Requested by <span className="font-bold text-slate-800">{row.requester.firstName} {row.requester.lastName}</span> · {row.requester.email}</p>
            {renderActions(row)}
          </div>
        )}
      />
    </div>
  );
}
