/**
 * Composant standardisé pour le bouton de rafraîchissement
 * 
 * Fournit un style uniforme pour tous les boutons "Actualiser" dans les pages admin
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export interface RefreshButtonProps {
  /**
   * Callback appelé lors du clic sur le bouton
   */
  onClick: () => void;
  
  /**
   * Indique si le rafraîchissement est en cours
   * @default false
   */
  isRefreshing?: boolean;
  
  /**
   * Indique si le bouton est désactivé
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Texte du bouton
   * @default "Actualiser"
   */
  label?: string;
  
  /**
   * Afficher le texte du bouton
   * @default true
   */
  showLabel?: boolean;
  
  /**
   * Taille du bouton
   * @default "sm"
   */
  size?: "sm" | "default" | "lg";
  
  /**
   * Classe CSS personnalisée à ajouter
   */
  className?: string;
}

/**
 * Bouton de rafraîchissement standardisé
 */
export function RefreshButton({
  onClick,
  isRefreshing = false,
  disabled = false,
  label = "Actualiser",
  showLabel = true,
  className = "",
}: RefreshButtonProps) {
  // Hauteur uniforme avec AddButton : h-10 sm:h-12
  // Si showLabel est false, le bouton est carré (même hauteur et largeur)
  const heightClass = showLabel 
    ? "h-10 sm:h-12" 
    : "h-10 sm:h-12 w-10 sm:w-12 p-0";
  
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled || isRefreshing}
      className={`${heightClass} hover:bg-gray-100 ${className}`}
      title="Actualiser les données"
      aria-label={label}
    >
      <RefreshCw 
        className={`w-4 h-4 ${showLabel ? "mr-2" : ""} ${isRefreshing ? "animate-spin" : ""}`} 
        aria-hidden="true"
      />
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </Button>
  );
}

