import { Input } from "@/components/form";
import Button from "@/components/layout/Button";
import type { ManualCourseRequest } from "@api/courses";

type ManualCourseRequestFormProps = {
  value: ManualCourseRequest;
  isSubmitting: boolean;
  onChange: (field: keyof ManualCourseRequest, value: string) => void;
  onSubmit: () => Promise<void>;
};

export default function ManualCourseRequestForm({
  value,
  isSubmitting,
  onChange,
  onSubmit,
}: ManualCourseRequestFormProps) {
  return (
    <div>
      <p className="text-sm text-slate-600">
        Don&apos;t see the correct course? Enter its location and send it for manual setup.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          dense
          className="sm:col-span-2"
          label="Course Name"
          maxLength={120}
          value={value.courseName}
          onChange={(event) => onChange("courseName", event.target.value)}
        />
        <Input
          dense
          label="City"
          maxLength={80}
          value={value.city}
          onChange={(event) => onChange("city", event.target.value)}
        />
        <Input
          dense
          label="State"
          placeholder="Michigan or MI"
          maxLength={50}
          value={value.state}
          onChange={(event) => onChange("state", event.target.value)}
        />
      </div>
      <div className="mt-5">
        <Button
          type="button"
          variant="primary"
          disabled={isSubmitting}
          onClick={() => void onSubmit()}
        >
          {isSubmitting ? "Sending Request..." : "Send Manual Course Request"}
        </Button>
      </div>
    </div>
  );
}
