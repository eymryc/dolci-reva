/**
 * Table des équipements (Amenities)
 * 
 * Utilise le composant DataTable générique pour afficher les équipements
 * avec tri, filtrage et pagination.
 */

"use client";

import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Amenity } from "@/hooks/use-amenities";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DataTable } from "@/components/admin/shared/DataTable";
import { ActionButtons } from "@/components/admin/shared/ActionButtons";

interface AmenityTableProps {
  data: Amenity[];
  onEdit: (amenity: Amenity) => void;
  onDelete: (amenity: Amenity) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AmenityTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: AmenityTableProps) {
  const columns = useMemo<ColumnDef<Amenity>[]>(
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
          const amenity = row.original;
          return (
            <ActionButtons
              onEdit={() => onEdit(amenity)}
              onDelete={() => onDelete(amenity)}
              showDirectButtons={true}
            />
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
      searchPlaceholder="Rechercher une commodité..."
      emptyMessage="Aucune donnée"
    />
  );
}
