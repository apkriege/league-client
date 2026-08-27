import { DrawerActionPanel } from "@/components/league/AdminOpsPanels";
import {
  useCreateLeagueAnnouncement,
  useDeleteLeagueAnnouncement,
  useUpdateLeagueAnnouncement,
} from "@api/operations/mutations";
import { useLeagueAnnouncements } from "@api/operations/queries";
import dayjs from "dayjs";
import { ChevronDown, Edit, MessageSquareText, X } from "lucide-react";
import { useState } from "react";

type AnnouncementDraft = {
  title: string;
  body: string;
};

export default function LeagueAnnouncementsPanel({
  leagueId,
  canManage = false,
}: {
  leagueId: number;
  canManage?: boolean;
}) {
  const { data: announcements = [] } = useLeagueAnnouncements(leagueId);
  const createAnnouncement = useCreateLeagueAnnouncement(leagueId);
  const updateAnnouncement = useUpdateLeagueAnnouncement(leagueId);
  const deleteAnnouncement = useDeleteLeagueAnnouncement(leagueId);
  const [isExpanded, setIsExpanded] = useState(canManage);
  const [form, setForm] = useState<AnnouncementDraft>({
    title: "",
    body: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, AnnouncementDraft>>({});

  const canSubmit = form.title.trim().length > 0 && form.body.trim().length > 0;

  const submit = () => {
    createAnnouncement.mutate(
      {
        title: form.title.trim(),
        body: form.body.trim(),
      },
      {
        onSuccess: () => {
          setForm({ title: "", body: "" });
          setIsExpanded(true);
        },
      }
    );
  };

  const startEdit = (announcement: any) => {
    const id = Number(announcement.id);
    setEditingId(id);
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        title: String(announcement.title || ""),
        body: String(announcement.body || ""),
      },
    }));
  };

  const saveEdit = (announcementId: number) => {
    const draft = drafts[announcementId];
    if (!draft?.title.trim() || !draft?.body.trim()) return;

    updateAnnouncement.mutate(
      {
        announcementId,
        data: {
          title: draft.title.trim(),
          body: draft.body.trim(),
        },
      },
      {
        onSuccess: () => setEditingId(null),
      }
    );
  };

  const removeAnnouncement = (announcementId: number) => {
    deleteAnnouncement.mutate(announcementId);
  };

  const panel = (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50"
        aria-expanded={isExpanded}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">Announcements</h2>
            <p className="text-[11px] text-gray-500">League updates</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">{announcements.length}</span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-3">
          {canManage && (
            <div className="mb-3 grid gap-2">
              <div className="grid gap-2">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Announcement title"
                  maxLength={140}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
                <textarea
                  value={form.body}
                  onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                  placeholder="What should league members know?"
                  maxLength={2000}
                  className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit || createAnnouncement.isPending}
                    className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createAnnouncement.isPending ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {announcements.length === 0 ? (
              <div className="py-3 text-sm text-gray-400">
                <p>No announcements.</p>
              </div>
            ) : (
              announcements.map((announcement: any) => {
                const id = Number(announcement.id);
                const isEditing = editingId === id;
                const draft = drafts[id] || {
                  title: String(announcement.title || ""),
                  body: String(announcement.body || ""),
                };

                return (
                  <article
                    key={announcement.id}
                    className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-blue-950"
                  >
                    {canManage && isEditing ? (
                      <div className="grid gap-2">
                        <input
                          value={draft.title}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [id]: { ...draft, title: event.target.value },
                            }))
                          }
                          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={draft.body}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [id]: { ...draft, body: event.target.value },
                            }))
                          }
                          className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(id)}
                            disabled={
                              updateAnnouncement.isPending ||
                              !draft.title.trim() ||
                              !draft.body.trim()
                            }
                            className="rounded-md bg-blue-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updateAnnouncement.isPending ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <MessageSquareText size={13} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-blue-950">
                                {announcement.title}
                              </h3>
                              <p className="mt-0.5 text-[11px] text-blue-800/60">
                                {announcement.author
                                  ? `${announcement.author.firstName} ${announcement.author.lastName}`
                                  : "League admin"}{" "}
                                · {dayjs(announcement.createdAt).format("MMM D, YYYY h:mm A")}
                              </p>
                            </div>
                            {canManage && (
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(announcement)}
                                  className="rounded-md p-1 text-blue-700/60 transition hover:bg-blue-100 hover:text-blue-800"
                                  aria-label="Edit announcement"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeAnnouncement(id)}
                                  disabled={deleteAnnouncement.isPending}
                                  className="rounded-md p-1 text-blue-700/60 transition hover:bg-blue-100 hover:text-red-600 disabled:opacity-50"
                                  aria-label="Remove announcement for all league members"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-blue-950/80">
                            {announcement.body}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );

  if (canManage) {
    return (
      <DrawerActionPanel
        title="Announcements"
        description="Post and manage commissioner updates."
        icon={<MessageSquareText size={15} />}
      >
        {panel}
      </DrawerActionPanel>
    );
  }

  return panel;
}
