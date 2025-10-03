import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="w-1 h-8 bg-gradient-to-b from-theme-primary to-orange-400 rounded-full"></div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
    </div>
    <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
      {subtitle}
    </p>
    <div className="w-16 h-1 bg-gradient-to-r from-theme-primary to-orange-400 rounded-full"></div>
  </div>
);

export default SectionHeader; 