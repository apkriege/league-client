import { useEffect, useMemo, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { readScoreDraft } from "./scoreDraftStorage";

export function useScoreDraft<T extends FieldValues>({
  methods, leagueId, eventId, flightId, enabled, scope = "",
}: {
  methods: UseFormReturn<T>;
  leagueId?: string | number;
  eventId?: string | number;
  flightId?: string | number;
  enabled: boolean;
  scope?: string;
}) {
  const [baseline] = useState(() => methods.getValues());
  const draftScope = useMemo(() => JSON.stringify([scope, baseline]), [scope, baseline]);
  const storageKey = `score-draft:v2:${leagueId}:${eventId}:${flightId}`;
  const cleared = useRef(false);
  const [initial] = useState(() => {
    try {
      return { draft: enabled ? readScoreDraft(window.localStorage, storageKey, draftScope, baseline) : null, error: false };
    } catch { return { draft: null, error: true }; }
  });
  const [hasDraft, setHasDraft] = useState(Boolean(initial.draft));
  const [savedAt, setSavedAt] = useState<string | null>(initial.draft?.savedAt ?? null);
  const [storageError, setStorageError] = useState(initial.error);

  useEffect(() => {
    if (enabled && initial.draft?.scope === draftScope) methods.reset(initial.draft.values);
  }, [enabled, initial, methods, draftScope]);

  useEffect(() => {
    if (!enabled) return;
    return methods.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (cleared.current) return;
        try {
          const savedAt = new Date().toISOString();
          window.localStorage.setItem(storageKey, JSON.stringify({ version: 2, scope: draftScope, values, savedAt }));
          setHasDraft(true);
          setSavedAt(savedAt);
          setStorageError(false);
        } catch { setStorageError(true); }
      },
    });
  }, [enabled, methods, storageKey, draftScope]);

  const clearDraft = () => {
    cleared.current = true;
    try { window.localStorage.removeItem(storageKey); } catch { setStorageError(true); }
    setHasDraft(false);
    setSavedAt(null);
  };
  return { hasDraft, savedAt, storageError, clearDraft, discardDraft: () => { clearDraft(); cleared.current = false; } };
}
