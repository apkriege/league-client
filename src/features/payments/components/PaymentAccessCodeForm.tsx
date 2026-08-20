import { Input } from "@/components/form";
import Button from "@/components/layout/Button";
import { useToast } from "@/context/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { useRedeemPaymentBypassCode } from "@api/payments/mutations";
import { KeyRound } from "lucide-react";
import { useState } from "react";

interface PaymentAccessCodeFormProps {
  onRedeemed?: () => void | Promise<unknown>;
}

export default function PaymentAccessCodeForm({ onRedeemed }: PaymentAccessCodeFormProps) {
  const [code, setCode] = useState("");
  const redeemCode = useRedeemPaymentBypassCode();
  const { show } = useToast();

  const redeem = async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      show("Enter your payment access code.", "warning");
      return;
    }

    try {
      const result = await redeemCode.mutateAsync(normalizedCode);
      setCode("");
      show(result.message, "success");
      await onRedeemed?.();
    } catch (error) {
      show(getApiErrorMessage(error, "Unable to apply payment access code."), "error");
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
        <KeyRound size={14} />
        Payment access code
      </div>
      <div className="flex items-end gap-2">
        <Input
          dense
          label="Code"
          placeholder="Enter access code"
          value={code}
          autoComplete="off"
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void redeem();
            }
          }}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={redeemCode.isPending}
          onClick={() => void redeem()}
        >
          {redeemCode.isPending ? "Applying..." : "Apply"}
        </Button>
      </div>
    </div>
  );
}
