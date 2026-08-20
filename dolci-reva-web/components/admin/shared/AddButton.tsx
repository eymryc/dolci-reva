/**
 * Composant standardisé pour le bouton d'ajout dans les tables
 * 
 * Fournit un style uniforme pour tous les boutons "Ajouter" dans les pages admin
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export interface AddButtonProps {
  /**
   * Callback appelé lors du clic sur le bouton
   */
  onClick: () => void;
  
  /**
   * Texte du bouton (affiché sur les écrans moyens et grands)
   * @default "Ajouter"
   */
  label?: string;
  
  /**
   * Indique si le bouton est en cours de chargement
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Indique si le bouton est désactivé
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Tooltip à afficher au survol
   */
  title?: string;
  
  /**
   * Classe CSS personnalisée à ajouter
   */
  className?: string;
}

/**
 * Bouton d'ajout standardisé
 */
export function AddButton({
  onClick,
  label = "Ajouter",
  isLoading = false,
  disabled = false,
  title,
  className = "",
}: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg h-10 sm:h-12 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-4 ${className}`}
      disabled={disabled || isLoading}
      title={title}
      aria-label={label}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 sm:mr-2" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

