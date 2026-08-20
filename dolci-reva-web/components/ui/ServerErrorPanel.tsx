"use client";
import { useEffect, useRef } from "react";
import { RiErrorWarningLine, RiCloseLine } from "react-icons/ri";

interface ServerErrorPanelProps {
  errors: Record<string, string[]>;
  fieldLabels?: Record<string, string>;
  onClose?: () => void;
  title?: string;
  description?: string;
  show?: boolean;
}

export function ServerErrorPanel({
  errors,
  fieldLabels = {},
  onClose,
  title = "Erreurs de validation",
  description = "Veuillez corriger les erreurs suivantes :",
  show = true,
}: ServerErrorPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Faire défiler vers le panneau quand il apparaît
  useEffect(() => {
    if (show && Object.keys(errors).length > 0 && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [show, errors]);

  if (!show || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      data-error-panel
      className="mb-6 p-5 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-lg animate-fade-in-up relative overflow-hidden"
    >
      {/* Effet de gradient animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-orange-100/20 to-red-100/20 opacity-50 animate-pulse"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
              <RiErrorWarningLine className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-red-700">{title}</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100"
              aria-label="Fermer le panneau d'erreurs"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-red-600 mb-4 font-medium">{description}</p>

        <ul className="space-y-2">
          {Object.entries(errors).map(([field, messages]) => {
            const fieldLabel = fieldLabels[field] || field;

            return (
              <li key={field} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <div className="flex-1">
                  <span className="font-semibold text-red-700">{fieldLabel}:</span>
                  <ul className="ml-4 mt-1 space-y-1">
                    {messages.map((message, index) => (
                      <li key={index} className="text-sm text-red-600">
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

