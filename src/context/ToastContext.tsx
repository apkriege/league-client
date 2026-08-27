import { subscribeToast } from "@/lib/toastEvents";
import { useState, useCallback, useEffect, useRef } from "react";
import { ToastContext, type Toast, type ToastType } from "./toastContextValue";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const recentMessagesRef = useRef<Map<string, number>>(new Map());
  const lastErrorAtRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "info", duration: number = 3000) => {
    const key = `${type}:${message}`;
    const now = Date.now();
    const lastShown = recentMessagesRef.current.get(key) ?? 0;
    if (now - lastShown < 1500) return;
    if (type === "error" && now - lastErrorAtRef.current < 500) return;
    recentMessagesRef.current.set(key, now);
    if (type === "error") lastErrorAtRef.current = now;

    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  useEffect(() => subscribeToast(show), [show]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return <ToastContext.Provider value={{ toasts, show, remove }}>{children}</ToastContext.Provider>;
}
