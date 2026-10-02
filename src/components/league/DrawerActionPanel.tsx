import { type ReactNode, useState } from "react";
import Drawer from "@mui/material/Drawer";
import { X } from "lucide-react";

export function DrawerActionPanel({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">{icon}{title}</button>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { role: "dialog", "aria-label": title, "aria-modal": true, sx: { width: { xs: "100%", sm: 576 }, maxWidth: "100%" } } }}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
        <div><h3 className="text-lg font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>
        <button type="button" aria-label={`Close ${title}`} onClick={() => setOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={18} /></button>
      </div>
      <div className="p-5">{children}</div>
    </Drawer>
  </>;
}
