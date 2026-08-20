"use client";

import type { ReactNode } from "react";
import { Check, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormStep {
  id: string;
  title: string;
  description?: string;
}

interface StepFormShellProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (index: number) => void;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  submitLabel?: string;
  className?: string;
}

export function StepFormShell({
  steps,
  currentStep,
  onStepChange,
  children,
  onBack,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  isLoading,
  nextLabel = "Continuer",
  submitLabel = "Enregistrer",
  className,
}: StepFormShellProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stepper horizontal — mobile / tablette */}
      <div className="overflow-hidden border border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white p-3 lg:hidden">
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
            Étape {currentStep + 1} / {steps.length}
          </p>
          <p className="truncate text-xs font-semibold text-slate-700">
            {steps[currentStep]?.title}
          </p>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden bg-[#f08400]/15">
          <div
            className="h-full bg-gradient-to-r from-[#f08400] to-[#ffb347] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const active = index === currentStep;
            const done = index < currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange(index)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  active
                    ? "border-[#f08400] bg-[#f08400] text-white"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-[#f08400]/20 bg-white text-slate-500"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : <span>{index + 1}</span>}
                <span className="max-w-[7rem] truncate">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Stepper latéral — desktop */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-6 overflow-hidden border border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white p-3">
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
            />
            <div className="relative px-2 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
                Étape {currentStep + 1} / {steps.length}
              </p>
              <div className="mt-2.5 h-1 w-full overflow-hidden bg-[#f08400]/15">
                <div
                  className="h-full bg-gradient-to-r from-[#f08400] to-[#ffb347] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <nav className="relative mt-3 space-y-1">
              {steps.map((step, index) => {
                const active = index === currentStep;
                const done = index < currentStep;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepChange(index)}
                    className={cn(
                      "flex w-full items-start gap-3 px-2.5 py-3 text-left transition-colors duration-200",
                      active
                        ? "bg-white shadow-[0_8px_20px_-14px_rgba(240,132,0,0.5)]"
                        : "hover:bg-white/70"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-semibold transition-colors",
                        active
                          ? "bg-[#f08400] text-white shadow-[0_8px_16px_-8px_rgba(240,132,0,0.7)]"
                          : done
                            ? "bg-emerald-500 text-white"
                            : "border border-[#f08400]/25 bg-white text-slate-400"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-semibold tracking-tight",
                          active
                            ? "text-slate-900"
                            : done
                              ? "text-slate-700"
                              : "text-slate-500"
                        )}
                      >
                        {step.title}
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : null}
                      </span>
                      {step.description ? (
                        <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">
                          {step.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="relative flex min-h-[480px] flex-col border border-[#f08400]/20 bg-gradient-to-br from-white via-white to-[#fffaf5] lg:col-span-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f08400]/8 blur-3xl"
          />
          <div className="relative border-b border-[#f08400]/10 px-5 py-5 sm:px-8 sm:py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f08400]">
              Étape en cours
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {steps[currentStep]?.title}
            </h2>
            {steps[currentStep]?.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {steps[currentStep].description}
              </p>
            ) : null}
          </div>

          <div className="relative flex-1 overflow-visible px-5 py-6 sm:px-8 sm:py-8">
            {children}
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[#f08400]/10 bg-[#fff4e8]/50 px-5 py-4 sm:px-8">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="h-11 rounded-none border-[#f08400]/25 bg-white px-5 hover:bg-white"
            >
              {isFirst ? "Annuler" : "Retour"}
            </Button>
            {isLast ? (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className="h-11 rounded-none bg-[#f08400] px-7 font-semibold text-white shadow-[0_10px_28px_-14px_rgba(240,132,0,0.85)] hover:bg-[#d87200]"
              >
                {isLoading ? "Enregistrement…" : submitLabel}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className="h-11 rounded-none bg-[#f08400] px-7 font-semibold text-white shadow-[0_10px_28px_-14px_rgba(240,132,0,0.85)] hover:bg-[#d87200]"
              >
                {nextLabel}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
