import { useState, type FormEvent } from "react";
import { LifeBuoy, Send } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import SurfaceCard from "@/components/layout/SurfaceCard";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import { Label } from "@/components/form/Label";
import { useToast } from "@/context/useToast";
import {
  sendSupportMessage,
  type SupportCategory,
  type SupportMessageInput,
} from "@api/support";

const categoryOptions = [
  { value: "question", label: "Question" },
  { value: "bug", label: "Bug report" },
  { value: "feedback", label: "Feedback or suggestion" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

const initialForm: SupportMessageInput = {
  category: "question",
  subject: "",
  message: "",
};

export default function ContactSupport() {
  const { show } = useToast();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (subject.length < 3 || message.length < 10) {
      setError("Add a subject and at least 10 characters of detail.");
      return;
    }

    setError(null);
    setIsSending(true);
    try {
      const result = await sendSupportMessage({ ...form, subject, message });
      setForm(initialForm);
      show(result.message, "success");
    } catch (requestError: unknown) {
      const messageText =
        requestError && typeof requestError === "object" && "message" in requestError
          ? String(requestError.message)
          : "Unable to send your message right now.";
      setError(messageText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Contact Support"
        subTitle="Send a question, concern, or idea directly to the League Night Pro team"
      />

      <SurfaceCard as="section" className="mt-4 p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
          <LifeBuoy className="mt-0.5 shrink-0 text-sky-600" size={18} />
          <p className="text-xs leading-5 text-sky-900">
            Your account name and email will be included so support can reply directly to you.
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <Select
            label="What can we help with?"
            value={form.category}
            options={categoryOptions}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as SupportCategory,
              }))
            }
          />
          <Input
            label="Subject"
            maxLength={120}
            value={form.subject}
            onChange={(event) =>
              setForm((current) => ({ ...current, subject: event.target.value }))
            }
            placeholder="Briefly describe your concern"
          />
          <div>
            <Label htmlFor="support-message" text="Message" />
            <textarea
              id="support-message"
              required
              minLength={10}
              maxLength={4000}
              rows={8}
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              placeholder="Tell us what happened, what you expected, or what you would like to see improved."
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {form.message.length} / 4,000
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={14} />
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}
