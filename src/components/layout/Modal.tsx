import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function Modal({ isOpen, title, children, onClose }: ModalProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40" onClick={onClose} />}
      <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box w-full max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{title}</h3>
            <X size={20} className="cursor-pointer hover:text-gray-400" onClick={onClose} />
          </div>
          <div className="py-4">{children}</div>
        </div>
      </dialog>
    </>
  );
}
