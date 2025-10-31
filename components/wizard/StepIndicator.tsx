interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const percent = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-brand-green1/80">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`flex-1 text-center ${index === currentStep ? 'text-brand-green1' : 'text-brand-earth2/70'}`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-green1 to-brand-green2 transition-all duration-300"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
      </div>
      <p className="text-right text-xs font-medium text-brand-earth2/80">
        {currentStep + 1} / {steps.length}
      </p>
    </div>
  );
}
