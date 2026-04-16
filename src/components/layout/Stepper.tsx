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
  const resolvedNextLabel = nextLabel ?? (isLastStep ? "Submit" : "Next");

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
      className={`step-footer mt-4 w-full bg-white/90 p-2 flex justify-end border rounded-lg ${className}`}
    >
      <button
        className="btn btn-secondary mr-2"
        disabled={isFirstStep || isSubmitting}
        onClick={() => {
          onBack?.();

          if (smoothScroll) {
            runAfterRender(scrollToTop);
          }
        }}
      >
        {backLabel}
      </button>
      <button
        className="btn btn-primary"
        disabled={isSubmitting}
        onClick={() => {
          onNext();

          if (smoothScroll) {
            runAfterRender(scrollToTop);
          }
        }}
      >
        {resolvedNextLabel}
      </button>
    </div>
  );
}
