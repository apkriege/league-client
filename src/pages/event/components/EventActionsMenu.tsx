import { useState, type MouseEvent } from "react";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Ban, ChevronDown, PencilLine, Printer, Settings2, Trash2 } from "lucide-react";
import { SummaryPillButton } from "@/components/layout/SummaryPill";

type EventActionsMenuProps = {
  canModify: boolean;
  canPrint: boolean;
  isCanceling: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onPrint: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export default function EventActionsMenu({
  canModify,
  canPrint,
  isCanceling,
  isDeleting,
  onEdit,
  onPrint,
  onCancel,
  onDelete,
}: EventActionsMenuProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorElement);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const runAction = (action: () => void) => {
    setAnchorElement(null);
    action();
  };

  return (
    <div className="flex justify-end">
      <SummaryPillButton
        className="font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        aria-controls={isOpen ? "event-actions-menu" : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : undefined}
        onClick={openMenu}
      >
        <Settings2 size={13} className="text-slate-400" />
        Event Actions
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </SummaryPillButton>

      <Menu
        id="event-actions-menu"
        anchorEl={anchorElement}
        open={isOpen}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 205,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
            },
          },
          list: { dense: true, sx: { py: 0.75 } },
        }}
      >
        {canModify && (
          <MenuItem
            onClick={() => runAction(onEdit)}
            sx={{ mx: 0.75, minHeight: 34, borderRadius: 2, fontSize: 12, fontWeight: 600 }}
          >
            <ListItemIcon sx={{ minWidth: "28px !important", color: "text.secondary" }}>
              <PencilLine size={14} />
            </ListItemIcon>
            Edit Event
          </MenuItem>
        )}
        {canPrint && (
          <MenuItem
            onClick={() => runAction(onPrint)}
            sx={{ mx: 0.75, minHeight: 34, borderRadius: 2, fontSize: 12, fontWeight: 600 }}
          >
            <ListItemIcon sx={{ minWidth: "28px !important", color: "text.secondary" }}>
              <Printer size={14} />
            </ListItemIcon>
            Print Scorecards
          </MenuItem>
        )}
        {(canModify || canPrint) && <Divider sx={{ my: 0.5 }} />}
        {canModify && (
          <MenuItem
            disabled={isCanceling}
            onClick={() => runAction(onCancel)}
            sx={{
              mx: 0.75,
              minHeight: 34,
              borderRadius: 2,
              color: "warning.dark",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <ListItemIcon sx={{ minWidth: "28px !important", color: "inherit" }}>
              <Ban size={14} />
            </ListItemIcon>
            {isCanceling ? "Canceling..." : "Cancel Event"}
          </MenuItem>
        )}
        <MenuItem
          disabled={isDeleting}
          onClick={() => runAction(onDelete)}
          sx={{
            mx: 0.75,
            minHeight: 34,
            borderRadius: 2,
            color: "error.main",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <ListItemIcon sx={{ minWidth: "28px !important", color: "inherit" }}>
            <Trash2 size={14} />
          </ListItemIcon>
          {isDeleting ? "Deleting..." : "Delete Event"}
        </MenuItem>
      </Menu>
    </div>
  );
}
