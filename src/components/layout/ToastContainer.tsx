import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <Stack
      spacing={1}
      sx={{ position: "fixed", right: 16, bottom: 16, zIndex: (theme) => theme.zIndex.snackbar }}
    >
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          severity={toast.type}
          variant="filled"
          action={
            <IconButton
              aria-label="Dismiss notification"
              color="inherit"
              size="small"
              onClick={() => remove(toast.id)}
            >
              <X size={16} />
            </IconButton>
          }
          sx={{ width: { xs: "calc(100vw - 32px)", sm: 384 }, boxShadow: 8 }}
        >
          {toast.message}
        </Alert>
      ))}
    </Stack>
  );
}
