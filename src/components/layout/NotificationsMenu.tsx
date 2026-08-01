import { useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import dayjs from "dayjs";
import { Bell, X } from "lucide-react";
import { useClearNotification, useMarkNotificationRead } from "@api/operations/mutations";
import { useNotifications } from "@api/operations/queries";

export default function NotificationsMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const clearNotification = useClearNotification();
  const unreadCount = notifications.filter((notification: any) => !notification.readAt).length;

  return (
    <>
      <IconButton
        aria-label="Open notifications"
        aria-controls={anchorEl ? "notifications-menu" : undefined}
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        sx={{
          border: "1px solid rgba(0,0,0,0.05)",
          bgcolor: "white",
          color: "#1d4ed8",
          boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
          "&:hover": { bgcolor: "#eff6ff", color: "#1e40af" },
        }}
      >
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <Bell size={16} strokeWidth={2.5} />
        </Badge>
      </IconButton>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: 320, maxWidth: "calc(100vw - 24px)", p: 1 } } }}
      >
        <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">
          Notifications
        </p>
        <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-400">No notifications yet.</p>
          ) : (
            notifications.map((notification: any) => (
              <Box
                key={notification.id}
                component="div"
                onClick={() => markRead.mutate(Number(notification.id))}
                className={`group w-full cursor-pointer rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 ${
                  notification.readAt ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{notification.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{notification.body}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {dayjs(notification.createdAt).format("MMM D, h:mm A")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    {!notification.readAt && <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600" />}
                    <IconButton
                      type="button"
                      aria-label="Clear notification"
                      size="small"
                      disabled={clearNotification.isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        clearNotification.mutate(Number(notification.id));
                      }}
                    >
                      <X size={14} />
                    </IconButton>
                  </div>
                </div>
              </Box>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
}
