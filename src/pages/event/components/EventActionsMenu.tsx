import { useState, type MouseEvent, type ReactNode } from "react";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
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

type EventActionButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  icon: ReactNode;
  onClick: () => void;
  tone?: "default" | "warning" | "danger";
};

const actionToneClasses = {
  default: "text-slate-700 hover:bg-slate-100",
  warning: "text-amber-700 hover:bg-amber-50",
  danger: "text-red-600 hover:bg-red-50",
} as const;

function EventActionButton({
  children,
  disabled = false,
  icon,
  onClick,
  tone = "default",
}: EventActionButtonProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-8.5 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${actionToneClasses[tone]}`}
    >
      <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center opacity-70">
        {icon}
      </span>
      {children}
    </button>
  );
}

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

      <Popover
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
        }}
      >
        <div role="menu" aria-label="Event actions" className="p-1.5">
          {canModify && (
            <EventActionButton icon={<PencilLine size={14} />} onClick={() => runAction(onEdit)}>
              Edit Event
            </EventActionButton>
          )}
          {canPrint && (
            <EventActionButton icon={<Printer size={14} />} onClick={() => runAction(onPrint)}>
              Print Scorecards
            </EventActionButton>
          )}
          {(canModify || canPrint) && <Divider sx={{ my: 0.5 }} />}
          {canModify && (
            <EventActionButton
              disabled={isCanceling}
              icon={<Ban size={14} />}
              onClick={() => runAction(onCancel)}
              tone="warning"
            >
              {isCanceling ? "Canceling..." : "Cancel Event"}
            </EventActionButton>
          )}
          <EventActionButton
            disabled={isDeleting}
            icon={<Trash2 size={14} />}
            onClick={() => runAction(onDelete)}
            tone="danger"
          >
            {isDeleting ? "Deleting..." : "Delete Event"}
          </EventActionButton>
        </div>
      </Popover>
    </div>
  );
}
