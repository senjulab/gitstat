interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`rounded-full transition-all ${
            index === currentStep
              ? "w-4 h-2 bg-[#9580ff]"
              : "w-2 h-2 bg-neutral-300"
          }`}
        />
      ))}
    </div>
  );
}
