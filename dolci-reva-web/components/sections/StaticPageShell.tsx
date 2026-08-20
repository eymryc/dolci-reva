import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StaticPageShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  narrow?: boolean;
};

/**
 * Shared shell for company / legal / help pages.
 */
export default function StaticPageShell({
  eyebrow = "Dolci Rêva",
  title,
  subtitle,
  children,
  className,
  contentClassName,
  narrow = false,
}: StaticPageShellProps) {
  return (
    <div className={cn("min-h-screen bg-[#faf8f5]", className)}>
      <section className="relative overflow-hidden bg-[#12100c] py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#f08400]/20 to-transparent"
        />
        <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ffb347]">
            {eyebrow}
          </p>
          <div className="mx-auto mb-5 h-px w-14 bg-gradient-to-r from-transparent via-[#f08400] to-transparent" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-white/70 sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f08400]/80 to-transparent" />
      </section>

      <section className="relative py-14 sm:py-16 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#12100c06_1px,transparent_1px),linear-gradient(to_bottom,#12100c06_1px,transparent_1px)] bg-[size:28px_28px]"
        />
        <div
          className={cn(
            "container relative mx-auto px-4 sm:px-6 lg:px-8",
            narrow ? "max-w-3xl" : "max-w-6xl",
            contentClassName
          )}
        >
          {children}
        </div>
      </section>
    </div>
  );
}
