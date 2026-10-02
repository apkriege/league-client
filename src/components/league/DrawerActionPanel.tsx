import Button from "@/components/layout/Button";
import { type ReactNode, useState } from "react";
import Drawer from "@mui/material/Drawer";
import { X } from "lucide-react";

export function DrawerActionPanel({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <Button type="button" variant="primary" outline size="sm" sx={{ gap: 0.75, minHeight: { xs: 44, sm: 34 } }} onClick={() => setOpen(true)}>{icon}{title}</Button>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { role: "dialog", "aria-label": title, "aria-modal": true, sx: { width: { xs: "100%", sm: 420 }, maxWidth: "100%" } } }}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div><h3 className="text-sm font-bold text-slate-950">{title}</h3><p className="mt-1 text-xs text-slate-500">{description}</p></div>
        <button type="button" aria-label={`Close ${title}`} onClick={() => setOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={18} /></button>
      </div>
      <div className="p-4">{children}</div>
    </Drawer>
  </>;
}
