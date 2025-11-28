/**
 * Table des types de business
 * 
 * Utilise le composant DataTable générique pour afficher les types de business
 * avec tri, filtrage et pagination.
 */

"use client";

import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BusinessType } from "@/hooks/use-business-types";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DataTable } from "@/components/admin/shared/DataTable";

interface BusinessTypeTableProps {
  data: BusinessType[];
  onEdit: (businessType: BusinessType) => void;
  onDelete: (businessType: BusinessType) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function BusinessTypeTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: BusinessTypeTableProps) {
  const columns = useMemo<ColumnDef<BusinessType>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Nom
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.getValue("description") as string | undefined;
          return (
            <div className="text-gray-600">
              {description || <span className="text-gray-400 italic">Aucune description</span>}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const businessType = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(businessType)}
                className="hover:bg-blue-50 hover:text-blue-600"
                aria-label={`Modifier ${businessType.name}`}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(businessType)}
                className="hover:bg-red-50 hover:text-red-600"
                aria-label={`Supprimer ${businessType.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      addButton={addButton}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      searchPlaceholder="Rechercher un type de business..."
      emptyMessage="Aucune donnée"
    />
  );
}
