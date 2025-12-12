/**
 * Composant helper pour créer facilement une colonne d'actions dans DataTable
 * 
 * Supporte plusieurs actions personnalisées avec un menu déroulant
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

export interface ActionItem<TData> {
  /**
   * Label de l'action
   */
  label: string;
  
  /**
   * Icône React (optionnel)
   */
  icon?: React.ReactNode;
  
  /**
   * Callback appelé lors du clic
   */
  onClick: (row: TData) => void;
  
  /**
   * Indique si l'action est désactivée
   */
  disabled?: boolean | ((row: TData) => boolean);
  
  /**
   * Style variant (destructive pour les actions dangereuses)
   */
  variant?: "default" | "destructive";
  
  /**
   * Afficher un séparateur avant cette action
   */
  separator?: boolean;
}

export interface ActionsColumnProps<TData> {
  /**
   * Liste des actions à afficher
   */
  actions: ActionItem<TData>[];
  
  /**
   * Header de la colonne
   * @default "Actions"
   */
  header?: string;
  
  /**
   * Fonction pour déterminer si la colonne doit être masquée pour une ligne
   */
  shouldHide?: (row: TData) => boolean;
}

/**
 * Crée une colonne d'actions pour DataTable avec plusieurs actions personnalisées
 * 
 * @example
 * ```tsx
 * const columns = [
 *   // ... autres colonnes
 *   createActionsColumn<Restaurant>({
 *     actions: [
 *       {
 *         label: "Modifier",
 *         icon: <Edit2 className="mr-2 h-4 w-4" />,
 *         onClick: (restaurant) => handleEdit(restaurant),
 *       },
 *       {
 *         label: "Voir détails",
 *         icon: <Eye className="mr-2 h-4 w-4" />,
 *         onClick: (restaurant) => router.push(`/admin/restaurants/${restaurant.id}`),
 *       },
 *       {
 *         separator: true,
 *         label: "Supprimer",
 *         icon: <Trash2 className="mr-2 h-4 w-4" />,
 *         variant: "destructive",
 *         onClick: (restaurant) => handleDelete(restaurant),
 *       },
 *     ],
 *   }),
 * ];
 * ```
 */
export function createActionsColumn<TData>(
  props: ActionsColumnProps<TData>
): ColumnDef<TData> {
  const { actions, header = "Actions", shouldHide } = props;

  return {
    id: "actions",
    header,
    cell: ({ row }) => {
      const data = row.original;

      // Masquer la colonne si shouldHide retourne true
      if (shouldHide && shouldHide(data)) {
        return null;
      }

      // Filtrer les actions disponibles (celles qui ne sont pas désactivées)
      const availableActions = actions.filter((action) => {
        if (typeof action.disabled === "function") {
          return !action.disabled(data);
        }
        return !action.disabled;
      });

      // Si aucune action disponible, ne rien afficher
      if (availableActions.length === 0) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 hover:bg-gray-100"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {availableActions.map((action, index) => (
              <React.Fragment key={index}>
                {action.separator && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => action.onClick(data)}
                  disabled={
                    typeof action.disabled === "function"
                      ? action.disabled(data)
                      : action.disabled
                  }
                  className={
                    action.variant === "destructive"
                      ? "cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      : "cursor-pointer"
                  }
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}



