import { Input, Select } from "@/components/form";
import Button from "@/components/layout/Button";
import SectionKicker from "@/components/layout/SectionKicker";
import { useToast } from "@/context/useToast";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  useCreatePaymentBypassCode,
  useRevokePaymentBypassCode,
} from "@api/admin/mutations";
import { usePaymentBypassCodes } from "@api/admin/queries";
import type { PaymentBypassCodeStatus } from "@api/admin/types";
import dayjs from "dayjs";
import { Copy, KeyRound, Plus, ShieldX } from "lucide-react";
import { useState } from "react";

const statusClass: Record<PaymentBypassCodeStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  redeemed: "border-sky-200 bg-sky-50 text-sky-700",
  expired: "border-amber-200 bg-amber-50 text-amber-700",
  revoked: "border-slate-200 bg-slate-100 text-slate-500",
};

export default function PaymentBypassCodes() {
  const { data: codes = [], isLoading } = usePaymentBypassCodes();
  const createCode = useCreatePaymentBypassCode();
  const revokeCode = useRevokePaymentBypassCode();
  const { show } = useToast();
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const generate = async () => {
    try {
      const result = await createCode.mutateAsync({ label: label.trim(), expiresInDays });
      setGeneratedCode(result.code);
      setLabel("");
      show("One-time payment access code generated.", "success");
    } catch (error) {
      show(getApiErrorMessage(error, "Unable to generate payment access code."), "error");
    }
  };

  const copyGeneratedCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    show("Code copied.", "success");
  };

  const revoke = async (id: number) => {
    if (!window.confirm("Revoke this unused payment access code?")) return;
    try {
      await revokeCode.mutateAsync(id);
      show("Payment access code revoked.", "success");
    } catch (error) {
      show(getApiErrorMessage(error, "Unable to revoke payment access code."), "error");
    }
  };

  return (
    <section className="space-y-3">
      <SectionKicker>One-Time Payment Access Codes</SectionKicker>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end">
          <Input
            label="Customer or reason"
            placeholder="Example: Community partner"
            value={label}
            maxLength={100}
            onChange={(event) => setLabel(event.target.value)}
          />
          <Select
            label="Expires in"
            value={expiresInDays}
            options={[
              { value: 7, label: "7 days" },
              { value: 30, label: "30 days" },
              { value: 60, label: "60 days" },
              { value: 90, label: "90 days" },
            ]}
            onChange={(event) => setExpiresInDays(Number(event.target.value))}
          />
          <Button
            variant="primary"
            disabled={createCode.isPending}
            onClick={() => void generate()}
          >
            <Plus size={14} />
            {createCode.isPending ? "Generating..." : "Generate Code"}
          </Button>
        </div>

        {generatedCode && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <KeyRound size={14} /> Copy this code now—it will not be shown again.
                </p>
                <p className="mt-2 font-mono text-lg font-black tracking-wider text-slate-950">
                  {generatedCode}
                </p>
              </div>
              <Button variant="success" onClick={() => void copyGeneratedCode()}>
                <Copy size={14} /> Copy Code
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[minmax(120px,1fr)_110px_140px_180px_70px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>Code / Label</span><span>Status</span><span>Expires</span><span>Redeemed By</span><span />
        </div>
        {isLoading ? (
          <p className="px-4 py-8 text-center text-xs text-slate-500">Loading codes...</p>
        ) : codes.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-slate-500">No codes generated yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {codes.map((code) => (
              <div
                key={code.id}
                className="grid grid-cols-[minmax(120px,1fr)_110px_140px_180px_70px] items-center gap-3 px-4 py-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-mono font-bold text-slate-800">{code.codeHint}</p>
                  <p className="truncate text-[10px] text-slate-400">{code.label || "No label"}</p>
                </div>
                <span className={`w-fit rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusClass[code.status]}`}>
                  {code.status}
                </span>
                <span className="text-slate-500">
                  {code.expiresAt ? dayjs(code.expiresAt).format("MMM D, YYYY") : "Never"}
                </span>
                <div className="min-w-0 text-slate-500">
                  {code.redeemedBy ? (
                    <><p className="truncate font-semibold text-slate-700">{code.redeemedBy.firstName} {code.redeemedBy.lastName}</p><p className="truncate text-[10px]">{code.redeemedBy.email}</p></>
                  ) : "—"}
                </div>
                {code.status === "active" && (
                  <button
                    type="button"
                    aria-label="Revoke code"
                    className="justify-self-end text-red-500 hover:text-red-700"
                    disabled={revokeCode.isPending}
                    onClick={() => void revoke(code.id)}
                  >
                    <ShieldX size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
