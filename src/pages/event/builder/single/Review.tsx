import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { Trophy } from "lucide-react";
import type { StepKey } from "./SingleEvent";

export default function ReviewForm({ step }: { step: StepKey }) {
  return (
    <div>
      <PageHeader
        title="Review Event"
        subTitle="Review your event setup before creating the event."
        icon={<Trophy size={14} />}
        iconText={step.toUpperCase()}
      />
      <Card>
        <p className="text-sm text-base-content/70">
          All steps complete. Click next to create the event.
        </p>
      </Card>
    </div>
  );
}
