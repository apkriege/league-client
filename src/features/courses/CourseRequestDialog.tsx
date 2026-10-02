import { lazy, Suspense, useState } from "react";
import Button from "@/components/layout/Button";
import Modal from "@/components/layout/Modal";

const CourseRequestPanel = lazy(() => import("@/pages/course/components/CourseRequestPanel"));

export default function CourseRequestDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="primary" outline size="sm" sx={{ minHeight: { xs: 44, sm: 34 } }} onClick={() => setOpen(true)}>Request a missing course</Button>
      {open && <Modal isOpen width="compact" title="Request a course" onClose={() => setOpen(false)}>
        <Suspense fallback={<p role="status">Loading course requests…</p>}><CourseRequestPanel embedded /></Suspense>
      </Modal>}
    </>
  );
}
