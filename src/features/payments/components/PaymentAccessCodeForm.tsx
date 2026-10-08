import { Input } from "@/components/form";
import Button from "@/components/layout/Button";
import { useToast } from "@/context/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import { useRedeemPaymentBypassCode } from "@api/payments/mutations";
import { KeyRound } from "lucide-react";
import { useState } from "react";

interface PaymentAccessCodeFormProps {
  leagueId?: number;
  disabled?: boolean;
  onRedeemed?: () => void | Promise<unknown>;
}

export default function PaymentAccessCodeForm({ onRedeemed, leagueId, disabled = false }: PaymentAccessCodeFormProps) {
  const [codeError, setCodeError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const redeemCode = useRedeemPaymentBypassCode();
  const { show } = useToast();

  const redeem = async () => {
    if (disabled || redeemCode.isPending) return;
    setCodeError(null);
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      show("Enter your payment access code.", "warning");
      return;
    }

    try {
      const result = await redeemCode.mutateAsync(leagueId === undefined ? normalizedCode : {code:normalizedCode,leagueId});
      setCode("");
      show(result.message, "success");
      await onRedeemed?.();
    } catch (error) {
      setCodeError(getApiErrorMessage(error, "Unable to apply payment access code."));
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
          disabled={disabled || redeemCode.isPending}
          onChange={(event) => { setCode(event.target.value); setCodeError(null); }}
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
          disabled={disabled || redeemCode.isPending}
          onClick={() => void redeem()}
        >
          {redeemCode.isPending ? "Applying..." : "Apply"}
        </Button>
      </div>
      {codeError && <p role="alert" className="mt-2 text-xs text-red-700">{codeError}</p>}
    </div>
  );
}
