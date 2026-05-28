type StepperProps = {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
  smoothScroll?: boolean;
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
};

export default function Stepper({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  nextLabel,
  backLabel = "Back",
  className = "",
  smoothScroll = false,
  scrollTargetRef,
}: StepperProps) {
  const isFirstStep = step <= 1;
  const isLastStep = step >= totalSteps;
  const resolvedNextLabel = nextLabel ?? (isLastStep ? "Submit" : "Next →");

  const scrollToTop = () => {
    const scrollContainer = scrollTargetRef?.current?.closest(
      ".overflow-y-auto"
    ) as HTMLElement | null;

    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runAfterRender = (callback: () => void) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback);
    });
  };

  return (
    <div
      className={`step-footer mt-4 w-full bg-base-100 px-4 py-3 flex items-center justify-between border border-base-300 rounded-xl shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 === step
                ? "w-6 bg-primary"
                : i + 1 < step
                  ? "w-3 bg-primary/40"
                  : "w-3 bg-base-300"
            }`}
          />
        ))}
        <span className="text-[10px] text-gray-400 font-medium ml-1">
          {step} / {totalSteps}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-secondary btn-md"
          disabled={isFirstStep || isSubmitting}
          onClick={() => {
            onBack?.();
            if (smoothScroll) runAfterRender(scrollToTop);
          }}
        >
          {backLabel}
        </button>
        <button
          className="btn btn-primary btn-md"
          disabled={isSubmitting}
          onClick={() => {
            onNext();
            if (smoothScroll) runAfterRender(scrollToTop);
          }}
        >
          {isSubmitting ? "Submitting…" : resolvedNextLabel}
        </button>
      </div>
    </div>
  );
}
