import Button from "@/components/layout/Button";
import { AlertTriangle, LoaderCircle } from "lucide-react";

type PaymentReturnNoticeProps = {
  message: string;
  isChecking: boolean;
  onRetry: () => void;
};

export default function PaymentReturnNotice({
  message,
  isChecking,
  onRetry,
}: PaymentReturnNoticeProps) {
  return (
    <div
      className="my-4 flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800"
      role={isChecking ? "status" : "alert"}
    >
      <div className="flex min-w-0 items-start gap-2">
        {isChecking ? (
          <LoaderCircle className="mt-0.5 shrink-0 animate-spin" size={16} />
        ) : (
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
        )}
        <p className="text-xs font-medium">{message}</p>
      </div>
      {!isChecking && (
        <Button variant="warning" size="xs" onClick={onRetry}>
          Check Again
        </Button>
      )}
    </div>
  );
}
