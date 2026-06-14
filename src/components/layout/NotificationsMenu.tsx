import { useMarkNotificationRead } from "@api/operations/mutations";
import { useNotifications } from "@api/operations/queries";
import dayjs from "dayjs";
import { Bell } from "lucide-react";

export default function NotificationsMenu() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications.filter((notification: any) => !notification.readAt).length;

  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-ghost btn-sm relative rounded-full text-blue-700 hover:bg-blue-50 hover:text-blue-800">
        <Bell size={16} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-blue-700 px-1.5 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </summary>
      <div className="dropdown-content z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
        <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">
          Notifications
        </p>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-400">No notifications yet.</p>
          ) : (
            notifications.map((notification: any) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markRead.mutate(Number(notification.id))}
                className={`w-full rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 ${
                  notification.readAt ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{notification.title}</p>
                  {!notification.readAt && <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{notification.body}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {dayjs(notification.createdAt).format("MMM D, h:mm A")}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </details>
  );
}
