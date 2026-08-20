import { getApiErrorMessage } from "@/lib/apiError";

export class PaymentPipelineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentPipelineError";
  }
}

export const toPaymentPipelineError = (error: unknown, fallback: string) =>
  error instanceof PaymentPipelineError
    ? error
    : new PaymentPipelineError(getApiErrorMessage(error, fallback));
