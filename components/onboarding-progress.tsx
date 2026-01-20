interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`rounded-full transition-all ${
            index === currentStep
              ? "w-2 h-2 bg-indigo-400"
              : "w-1.5 h-1.5 bg-neutral-300"
          }`}
        />
      ))}
    </div>
  );
}
