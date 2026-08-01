import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  position?: "center" | "top";
  width?: "default" | "half";
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  position = "center",
  width = "default",
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      aria-labelledby="app-dialog-title"
      sx={{
        "& .MuiDialog-container": {
          alignItems: position === "top" ? "flex-start" : "center",
        },
        "& .MuiDialog-paper": {
          mt: position === "top" ? { xs: 2, sm: 4 } : undefined,
          width: width === "half" ? { xs: "calc(100% - 32px)", sm: "50vw" } : { xs: "calc(100% - 32px)", sm: "min(90vw, 720px)" },
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle id="app-dialog-title" sx={{ pr: 7, fontSize: "1.125rem", fontWeight: 800 }}>
        {title}
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 16, top: 14 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}
