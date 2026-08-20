import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
  /** Small uppercase label above the title */
  eyebrow?: string;
  /** Invert colors for dark sections */
  tone?: "light" | "dark";
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className = "",
  eyebrow,
  tone = "light",
}) => {
  const isCentered = className.includes("text-center");
  const isDark = tone === "dark";

  return (
    <div className={`space-y-3 ${className}`}>
      {eyebrow ? (
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${
            isDark ? "text-[#ffb347]" : "text-[#f08400]"
          } ${isCentered ? "mx-auto" : ""}`}
        >
          {eyebrow}
        </p>
      ) : (
        <div
          className={`h-px w-12 bg-gradient-to-r from-[#f08400] to-[#ffb347] ${
            isCentered ? "mx-auto" : ""
          }`}
          aria-hidden
        />
      )}
      <h2
        className={`text-3xl font-bold tracking-tight md:text-4xl ${
          isDark ? "text-white" : "text-[#12100c]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`max-w-xl text-base leading-relaxed ${
          isDark ? "text-white/65" : "text-[#5c574f]"
        } ${isCentered ? "mx-auto" : ""}`}
      >
        {subtitle}
      </p>
    </div>
  );
};

export default SectionHeader;
