import { useEffect, useRef } from "react";

import type { ValidationIssue } from "./formValidation";

export default function ValidationFeedback({ issue }: { issue: ValidationIssue | null }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!issue) return;
    const scope = ref.current?.closest("[data-validation-scope]");
    let path = issue.field;
    let field: HTMLElement | null | undefined;
    while (path && !field) {
      const escaped = CSS.escape(path);
      field = scope?.querySelector<HTMLElement>(`[name="${escaped}"], [data-validation-field="${escaped}"]`);
      path = path.includes(".") ? path.slice(0, path.lastIndexOf(".")) : "";
    }
    if (field?.matches('input[type="hidden"]')) field = field.parentElement;
    const target = field?.matches('input:not([type="hidden"]), button, [role="combobox"]')
      ? field : field?.querySelector<HTMLElement>('input:not([type="hidden"]), button, [role="combobox"]');
    const details = (target ?? field)?.closest("details");
    if (details) details.open = true;
    (target ?? ref.current)?.focus();
  }, [issue]);
  return issue ? <p ref={ref} role="alert" tabIndex={-1} className="my-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">{issue.message}</p> : null;
}
