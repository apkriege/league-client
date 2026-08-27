import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { useToast } from "@/context/useToast";
import type { ToastType } from "@/context/toastContextValue";

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-700 text-white",
  error: "border-red-200 bg-red-700 text-white",
  info: "border-sky-200 bg-sky-700 text-white",
  warning: "border-amber-200 bg-amber-600 text-slate-950",
};

const toastIcons: Record<ToastType, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
  warning: TriangleAlert,
};

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[1400] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl ${toastStyles[toast.type]}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="-mr-1 rounded-full p-1 opacity-75 transition hover:bg-white/15 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
