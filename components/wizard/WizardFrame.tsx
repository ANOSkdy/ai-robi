import type { ReactNode } from 'react';
import OrganicDivider from '../OrganicDivider';
import StepIndicator from './StepIndicator';
import WizardNav, { type WizardNavProps } from './WizardNav';

interface WizardFrameProps {
  title: string;
  description: string;
  accent?: ReactNode;
  steps: string[];
  currentStep: number;
  children: ReactNode;
  nav: Omit<WizardNavProps, 'className'>;
}

export default function WizardFrame({ title, description, accent, steps, currentStep, children, nav }: WizardFrameProps) {
  return (
    <section className="relative mx-auto max-w-5xl">
      <div className="relative overflow-hidden rounded-[3rem] border border-brand-green2/30 bg-paper p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <span className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-green2/25 via-brand-earth1/25 to-transparent blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 right-10 h-52 w-52 rotate-[18deg] rounded-[4rem] bg-brand-earth1/20 blur-2xl" />
        <div className="relative grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-earth2/80">
                NATURE-FIRST WORKFLOW
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-green1 md:text-[2.5rem]">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-brand-earth2/90">{description}</p>
            </div>
            {accent ? (
              <div className="leaf-clip-a relative flex h-24 w-24 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-green2/50 to-brand-earth1/40 text-brand-green1 shadow-xl">
                <span className="leaf-clip-b absolute inset-2 bg-white/30" />
                <span className="relative text-sm font-semibold tracking-[0.2em] text-brand-green1/80">{accent}</span>
              </div>
            ) : null}
          </div>
          <OrganicDivider className="my-2" />
          <StepIndicator steps={steps} currentStep={currentStep} />
          <div className="relative mt-4 space-y-6 rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-inner backdrop-blur-sm sm:p-10">
            {children}
          </div>
          <WizardNav {...nav} />
        </div>
      </div>
    </section>
  );
}
