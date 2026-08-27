import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

type StoredDraft = {
  values: unknown;
  savedAt: string | null;
};

const readStoredDraft = (storageKey: string, enabled: boolean): StoredDraft | null => {
  if (!enabled) return null;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.values) return null;
    return {
      values: parsed.values,
      savedAt: parsed.savedAt || null,
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

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
    [leagueId, eventId, flightId],
  );
  const [initialDraft] = useState(() => readStoredDraft(storageKey, enabled));
  const [hasDraft, setHasDraft] = useState(Boolean(initialDraft));
  const [savedAt, setSavedAt] = useState<string | null>(initialDraft?.savedAt ?? null);

  useEffect(() => {
    if (enabled && initialDraft?.values) {
      methods.reset(initialDraft.values);
    }
  }, [enabled, initialDraft, methods]);

  useEffect(() => {
    if (!enabled) return;

    return methods.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        const payload = { values, savedAt: new Date().toISOString() };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
        setHasDraft(true);
        setSavedAt(payload.savedAt);
      },
    });
  }, [enabled, methods, storageKey]);

  const clearDraft = () => {
    window.localStorage.removeItem(storageKey);
    setHasDraft(false);
    setSavedAt(null);
  };

  return { hasDraft, savedAt, clearDraft };
}
