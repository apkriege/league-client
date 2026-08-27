import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table, { type Column } from "@/components/Table";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import {
  summarizeAdminUsers,
  toAdminUserListItem,
  type AdminUserListItem,
} from "@/features/users/adminUsers";
import { useAdminUsers } from "@api/admin/queries";
import { BadgeCheck, Clock3, ShieldCheck, Users } from "lucide-react";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const roleStyles: Record<string, string> = {
  SUPER: "border-violet-200 bg-violet-50 text-violet-700",
  ADMIN: "border-blue-200 bg-blue-50 text-blue-700",
  USER: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function UsersAdmin() {
  const { data: users = [], isLoading, isError, error } = useAdminUsers();

  if (isLoading) return <LoadingState>Loading users...</LoadingState>;

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={status === 403 ? "Access Denied" : "Unable to Load Users"}
        message={getApiErrorMessage(error, "The user directory could not be loaded right now.")}
        variant={status === 403 ? "forbidden" : "error"}
      />
    );
  }

  const rows = users.map(toAdminUserListItem);
  const summary = summarizeAdminUsers(users);
  const columns: Column<AdminUserListItem>[] = [
    {
      key: "id",
      label: "User ID",
      width: "90px",
      render: (value) => <span className="text-xs font-semibold text-slate-600">#{Number(value)}</span>,
    },
    {
      key: "displayName",
      label: "Name",
      render: (value) => <span className="text-sm font-semibold text-slate-900">{String(value)}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-xs text-slate-700">{String(value)}</span>,
    },
    {
      key: "roleLabel",
      label: "Type",
      width: "130px",
      render: (_value, row) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            roleStyles[row.role.toUpperCase()] ?? roleStyles.USER
          }`}
        >
          {row.roleLabel}
        </span>
      ),
    },
    {
      key: "verificationLabel",
      label: "Email Status",
      width: "130px",
      render: (_value, row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            row.emailVerifiedAt ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {row.emailVerifiedAt ? <BadgeCheck size={14} /> : <Clock3 size={14} />}
          {row.verificationLabel}
        </span>
      ),
    },
    {
      key: "managedLeagueCount",
      label: "Leagues",
      width: "90px",
      render: (value) => <span className="text-xs text-slate-700">{Number(value)}</span>,
    },
    {
      key: "playerProfileCount",
      label: "Player Profiles",
      width: "120px",
      render: (value) => <span className="text-xs text-slate-700">{Number(value)}</span>,
    },
    {
      key: "createdAt",
      label: "Joined",
      width: "130px",
      render: (value) => <span className="text-xs text-slate-600">{formatDate(String(value))}</span>,
    },
  ];

  const cards = [
    { label: "Total Users", value: summary.total, icon: Users },
    { label: "Super Admins", value: summary.superAdmins, icon: ShieldCheck },
    { label: "League Admins", value: summary.leagueAdmins, icon: BadgeCheck },
    { label: "Pending Email", value: summary.pendingVerification, icon: Clock3 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        subTitle="Review every active account, role, verification status, and league activity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <Icon size={16} className="text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <Table
        data={rows}
        columns={columns}
        heading="User Directory"
        searchPlaceholder="Search by name, email, role, or status..."
        pageSize={25}
      />
    </div>
  );
}
