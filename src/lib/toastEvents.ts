import type { ToastType } from "@/context/ToastContext";

type ToastListener = (message: string, type?: ToastType, duration?: number) => void;

const listeners = new Set<ToastListener>();

export function emitToast(message: string, type: ToastType = "info", duration?: number) {
  listeners.forEach((listener) => listener(message, type, duration));
}

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
