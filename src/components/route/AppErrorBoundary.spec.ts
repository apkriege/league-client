import { describe, expect, it } from "vitest";
import { PaymentPipelineError } from "@/features/payments/PaymentPipelineError";
import { getErrorDetails } from "./errorDetails";

describe("AppErrorBoundary", () => {
  it("presents payment pipeline failures as critical payment errors", () => {
    expect(getErrorDetails(new PaymentPipelineError("Payment confirmation failed."))).toEqual({
      title: "Payment could not be completed safely",
      message: "Payment confirmation failed.",
    });
  });
});
