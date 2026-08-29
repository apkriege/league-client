import type { LeagueAnnouncement } from "@api/operations/types";
import { useLeagueAnnouncements } from "@api/operations/queries";
import dayjs from "dayjs";
import { Bell, BellRing, ChevronRight, MessageSquareText, Settings, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

type LeagueNotificationsMenuProps = {
  leagueId: number;
  viewerKey: string;
  canManage?: boolean;
};

const getStoredLastSeenId = (storageKey: string) => {
  const storedValue = window.localStorage.getItem(storageKey);
  const parsedValue = Number(storedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getAuthorName = (announcement: LeagueAnnouncement) => {
  if (!announcement.author) return "League admin";

  const name = [announcement.author.firstName, announcement.author.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "League admin";
};

export default function LeagueNotificationsMenu({
  leagueId,
  viewerKey,
  canManage = false,
}: LeagueNotificationsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const storageKey = `league-announcements:last-seen:${viewerKey}:${leagueId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(() => getStoredLastSeenId(storageKey));
  const [newAtOpen, setNewAtOpen] = useState<Set<number>>(() => new Set());
  const {
    data: announcements = [],
    isLoading,
    isError,
  } = useLeagueAnnouncements(leagueId);

  const latestAnnouncementId = useMemo(
    () => announcements.reduce((latest, announcement) => Math.max(latest, announcement.id), 0),
    [announcements]
  );
  const unreadAnnouncements = useMemo(
    () => announcements.filter((announcement) => announcement.id > lastSeenId),
    [announcements, lastSeenId]
  );

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const markAllAsSeen = () => {
    if (latestAnnouncementId <= lastSeenId) return;
    window.localStorage.setItem(storageKey, String(latestAnnouncementId));
    setLastSeenId(latestAnnouncementId);
  };

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setNewAtOpen(new Set(unreadAnnouncements.map((announcement) => announcement.id)));
    setIsOpen(true);
    markAllAsSeen();
  };

  const unreadCount = unreadAnnouncements.length;
  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={unreadCount > 0 ? `Announcements, ${unreadCount} unread` : "Announcements"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border bg-white/80 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          isOpen
            ? "border-slate-300 text-slate-950"
            : "border-black/5 text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950"
        }`}
      >
        {unreadCount > 0 ? <BellRing size={18} /> : <Bell size={18} />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-white">
            {unreadLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="League announcements"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15"
        >
          <header className="flex items-center gap-3 bg-slate-950 px-4 py-3.5 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <BellRing size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black">Announcements</h2>
              <p className="mt-0.5 text-[11px] font-medium text-white/55">Updates from your league</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close announcements"
              className="rounded-lg p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <X size={16} />
            </button>
          </header>

          <div className="max-h-[min(65vh,32rem)] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-label="Loading announcements">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="animate-pulse rounded-xl border border-slate-100 p-3">
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                    <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-100" />
                    <div className="mt-3 h-2.5 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-bold text-slate-800">Announcements could not be loaded.</p>
                <p className="mt-1 text-xs text-slate-500">Close this panel and try again.</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <MessageSquareText size={19} />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800">No announcements yet</p>
                <p className="mt-1 text-xs text-slate-500">League updates will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {announcements.map((announcement) => {
                  const wasUnread = newAtOpen.has(announcement.id);

                  return (
                    <article
                      key={announcement.id}
                      className={`relative px-4 py-4 ${wasUnread ? "bg-emerald-50/55" : "bg-white"}`}
                    >
                      {wasUnread && (
                        <span
                          className="absolute left-1.5 top-5 h-1.5 w-1.5 rounded-full bg-emerald-500"
                          aria-label="New announcement"
                        />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-black leading-5 text-slate-900">
                          {announcement.title}
                        </h3>
                        {wasUnread && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        {getAuthorName(announcement)} · {dayjs(announcement.createdAt).format("MMM D, h:mm A")}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-600">
                        {announcement.body}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {canManage && (
            <Link
              to={`/league/${leagueId}/admin#league-announcements`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Settings size={14} />
              Manage announcements
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
