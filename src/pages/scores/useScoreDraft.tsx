import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

export function useScoreDraft({
  methods,
  leagueId,
  eventId,
  flightId,
  enabled,
}: {
  methods: UseFormReturn<any>;
  leagueId?: string | number;
  eventId?: string | number;
  flightId?: string | number;
  enabled: boolean;
}) {
  const storageKey = useMemo(
    () => `score-draft:${leagueId}:${eventId}:${flightId}`,
    [leagueId, eventId, flightId]
  );
  const [hasDraft, setHasDraft] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.values) {
        methods.reset(parsed.values);
        setHasDraft(true);
        setSavedAt(parsed.savedAt || null);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [enabled, methods, storageKey]);

  useEffect(() => {
    if (!enabled) return;

    const subscription = methods.watch((values) => {
      const payload = { values, savedAt: new Date().toISOString() };
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setHasDraft(true);
      setSavedAt(payload.savedAt);
    });

    return () => subscription.unsubscribe();
  }, [enabled, methods, storageKey]);

  const clearDraft = () => {
    window.localStorage.removeItem(storageKey);
    setHasDraft(false);
    setSavedAt(null);
  };

  return { hasDraft, savedAt, clearDraft };
}

export function ScoreDraftStatus({
  hasDraft,
  savedAt,
  onClear,
}: {
  hasDraft: boolean;
  savedAt: string | null;
  onClear: () => void;
}) {
  if (!hasDraft) return null;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          Draft autosaved{savedAt ? ` at ${new Date(savedAt).toLocaleTimeString()}` : ""}.
        </span>
        <button type="button" onClick={onClear} className="font-black underline">
          Clear draft
        </button>
      </div>
    </div>
  );
}
