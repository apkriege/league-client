import { useToast } from "@/context/ToastContext";
import { X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-10000 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative max-w-sm animate-fade-in
            backdrop-blur-md bg-slate-950/90 border border-white/10
            rounded-2xl shadow-2xl p-4
            ${toast.type === "success" ? "border-sky-300/40" : ""}
            ${toast.type === "error" ? "border-red-400/40" : ""}
            ${toast.type === "warning" ? "border-yellow-400/40" : ""}
            ${toast.type === "info" ? "border-sky-400/40" : ""}
          `}
        >
          <div className="flex items-center justify-between gap-4 w-full">
            <span className="text-sm font-medium text-white/90">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
