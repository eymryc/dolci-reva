/**
 * Composant standardisé pour les boutons d'actions dans les tables
 * 
 * Fournit un style uniforme pour toutes les actions (éditer, supprimer, etc.)
 */

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, Trash2, MoreVertical, XCircle } from "lucide-react";

export interface ActionButtonsProps {
  /**
   * Callback pour l'action d'édition
   */
  onEdit?: () => void;
  
  /**
   * Callback pour l'action de suppression
   */
  onDelete?: () => void;
  
  /**
   * Callback pour l'action d'annulation (optionnel)
   */
  onCancel?: () => void;
  
  /**
   * Indique si l'action d'annulation est désactivée
   */
  isCancelDisabled?: boolean;
  
  /**
   * Label personnalisé pour l'action d'édition
   * @default "Modifier"
   */
  editLabel?: string;
  
  /**
   * Label personnalisé pour l'action de suppression
   * @default "Supprimer"
   */
  deleteLabel?: string;
  
  /**
   * Label personnalisé pour l'action d'annulation
   * @default "Annuler"
   */
  cancelLabel?: string;
  
  /**
   * Afficher les boutons directement au lieu d'un menu déroulant
   * @default false
   */
  showDirectButtons?: boolean;
}

/**
 * Composant de boutons d'actions standardisé
 */
export function ActionButtons({
  onEdit,
  onDelete,
  onCancel,
  isCancelDisabled = false,
  editLabel = "Modifier",
  deleteLabel = "Supprimer",
  cancelLabel = "Annuler",
  showDirectButtons = false,
}: ActionButtonsProps) {
  // Si aucun callback n'est fourni, ne rien afficher
  if (!onEdit && !onDelete && !onCancel) {
    return null;
  }

  // Si showDirectButtons est true, afficher les boutons directement
  if (showDirectButtons) {
    return (
      <div className="flex gap-2">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            aria-label={editLabel}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            aria-label={deleteLabel}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isCancelDisabled}
            className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
            aria-label={cancelLabel}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Sinon, utiliser un menu déroulant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100"
          aria-label="Actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit && (
          <DropdownMenuItem
            onClick={onEdit}
            className="cursor-pointer"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {onCancel && (
          <DropdownMenuItem
            onClick={onCancel}
            disabled={isCancelDisabled}
            className="cursor-pointer"
          >
            <XCircle className="mr-2 h-4 w-4" />
            {cancelLabel}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}








