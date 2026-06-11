import PageHeader from "./PageHeader";
import { AlertTriangle, Lock, Search, ShieldAlert } from "lucide-react";
import { Link } from "react-router";

type PageStateProps = {
  title: string;
  message: string;
  variant?: "error" | "forbidden" | "notFound";
  actionTo?: string;
  actionLabel?: string;
};

const CONFIG = {
  error: {
    icon: <AlertTriangle size={14} />,
    badge: "ERROR",
    panel: "border-red-200 bg-red-50 text-red-700",
  },
  forbidden: {
    icon: <ShieldAlert size={14} />,
    badge: "ACCESS",
    panel: "border-amber-200 bg-amber-50 text-amber-700",
  },
  notFound: {
    icon: <Search size={14} />,
    badge: "MISSING",
    panel: "border-gray-200 bg-gray-50 text-gray-700",
  },
} as const;

export default function PageState({
  title,
  message,
  variant = "error",
  actionTo = "/leagues",
  actionLabel = "Back to Leagues",
}: PageStateProps) {
  const config = CONFIG[variant];

  return (
    <div>
      <PageHeader title={title} icon={config.icon} iconText={config.badge} />

      <div className={`mt-6 rounded-xl border px-5 py-5 shadow-sm ${config.panel}`}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-current/10 bg-white/60 p-2">
            {variant === "forbidden" ? <Lock size={16} /> : config.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{message}</p>
            <div className="mt-4">
              <Link
                to={actionTo}
                className="inline-flex items-center rounded-lg border border-current/15 bg-white/70 px-3 py-1.5 text-xs font-semibold hover:bg-white"
              >
                {actionLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
