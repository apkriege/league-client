import { lazy, Suspense, useState } from "react";
import Modal from "@/components/layout/Modal";

const CourseRequestPanel = lazy(() => import("@/pages/course/components/CourseRequestPanel"));

export default function CourseRequestDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Request a missing course</button>
      {open && <Modal isOpen title="Request a course" onClose={() => setOpen(false)}>
        <Suspense fallback={<p role="status">Loading course requests…</p>}><CourseRequestPanel /></Suspense>
      </Modal>}
    </>
  );
}
