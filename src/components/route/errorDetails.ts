import { PaymentPipelineError } from "@/features/payments/PaymentPipelineError";
import { isRouteErrorResponse } from "react-router";

export function getErrorDetails(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText || "Application Error"}`,
      message:
        typeof error.data === "string"
          ? error.data
          : error.data?.message || "The requested page could not be loaded.",
    };
  }

  if (error instanceof Error) {
    return {
      title:
        error instanceof PaymentPipelineError
          ? "Payment could not be completed safely"
          : "Something went wrong",
      message: error.message || "The app hit an unexpected error.",
    };
  }

  return {
    title: "Something went wrong",
    message: "The app hit an unexpected error.",
  };
}
