"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Dwelling, useToggleDwellingAvailability } from "@/hooks/use-dwellings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DwellingTableProps {
  data: Dwelling[];
  onEdit: (dwelling: Dwelling) => void;
  onDelete: (dwelling: Dwelling) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DwellingTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: DwellingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const toggleAvailabilityMutation = useToggleDwellingAvailability();

  const columns = useMemo<ColumnDef<Dwelling>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "description",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Description
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
        cell: ({ row }) => {
          const dwelling = row.original;
          const description = dwelling.description || "Aucune description";
          const truncated = description.length > 50 ? description.substring(0, 50) + "..." : description;
          return (
            <div className="font-semibold text-gray-900 min-w-[200px] max-w-xs" title={description}>
              {truncated}
            </div>
          );
        },
      },
      {
        id: "address",
        header: "Adresse",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <div className="text-gray-600 min-w-[200px]">
              <div className="font-medium">{dwelling.address}</div>
              <div className="text-xs text-gray-500">{dwelling.city}, {dwelling.country}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          const typeLabels: Record<string, string> = {
            STUDIO: "Studio",
            APPARTEMENT: "Appartement",
            VILLA: "Villa",
            PENTHOUSE: "Penthouse",
            DUPLEX: "Duplex",
            TRIPLEX: "Triplex",
          };
          return (
            <Badge className="bg-blue-100 text-blue-700 border border-blue-200/50">
              {typeLabels[type] || type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "structure_type_label",
        header: "Structure",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <Badge className="bg-purple-100 text-purple-700 border border-purple-200/50">
              {dwelling.structure_type_label || dwelling.structure_type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "construction_type_label",
        header: "Construction",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200/50">
              {dwelling.construction_type_label || dwelling.construction_type}
            </Badge>
          );
        },
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <div className="text-gray-600 text-sm">
              <div className="font-medium">{dwelling.phone}</div>
              {dwelling.whatsapp && (
                <div className="text-xs text-gray-500">WA: {dwelling.whatsapp}</div>
              )}
            </div>
          );
        },
      },
      {
        id: "details",
        header: "Détails",
        cell: ({ row }) => {
          const dwelling = row.original;
          const details: string[] = [];
          if (dwelling.rooms !== null && dwelling.rooms !== undefined) {
            details.push(`${dwelling.rooms} ch.`);
          }
          if (dwelling.bathrooms !== null && dwelling.bathrooms !== undefined) {
            details.push(`${dwelling.bathrooms} sdb`);
          }
          if (dwelling.piece_number !== null && dwelling.piece_number !== undefined) {
            details.push(`${dwelling.piece_number} pièces`);
          }
          return (
            <div className="text-gray-600 text-sm">
              {details.length > 0 ? details.join(" • ") : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "rent",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Loyer
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
        cell: ({ row }) => {
          const rent = row.getValue("rent") as number;
          return (
            <div className="text-gray-600 font-medium">
              {rent > 0 ? `${rent.toLocaleString()} FCFA` : <span className="text-gray-400 italic">Gratuit</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "visite_price",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Visite
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
        cell: ({ row }) => {
          const visitePrice = row.getValue("visite_price") as number;
          return (
            <div className="text-gray-600 text-sm">
              {visitePrice > 0 ? `${visitePrice.toLocaleString()} FCFA` : <span className="text-gray-400 italic">Gratuit</span>}
            </div>
          );
        },
      },
      {
        id: "security_deposit",
        header: "Caution",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <div className="text-gray-600 text-sm">
              <div className="font-medium">{dwelling.security_deposit_month_number} mois</div>
              {dwelling.security_deposit_amount > 0 && (
                <div className="text-xs text-gray-500">
                  {dwelling.security_deposit_amount.toLocaleString()} FCFA
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "rent_advance",
        header: "Avance",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <div className="text-gray-600 text-sm">
              <div className="font-medium">{dwelling.rent_advance_amount_number} mois</div>
              {dwelling.rent_advance_amount > 0 && (
                <div className="text-xs text-gray-500">
                  {dwelling.rent_advance_amount.toLocaleString()} FCFA
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "availability",
        header: "Disponibilité",
        cell: ({ row }) => {
          const dwelling = row.original;
          const isAvailable = dwelling.is_available ?? false;
          return (
            <Badge 
              className={
                isAvailable 
                  ? "bg-green-100 text-green-700 border border-green-200/50" 
                  : "bg-gray-100 text-gray-700 border border-gray-200/50"
              }
            >
              {isAvailable ? "Disponible" : "Indisponible"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const dwelling = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onEdit(dwelling)}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleAvailabilityMutation.mutate(dwelling.id)}
                  className="cursor-pointer"
                  disabled={toggleAvailabilityMutation.isPending}
                >
                  {dwelling.is_available ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Marquer occupé
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer disponible
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(dwelling)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, toggleAvailabilityMutation]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un hébergement..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          )}
          {addButton}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ tableLayout: 'auto' }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                      style={{ minWidth: '120px' }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#f08400]" />
                      <span>Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      // Permettre le retour à la ligne pour certaines colonnes
                      const isTextColumn = cell.column.id === 'description' || cell.column.id === 'address';
                      return (
                        <td 
                          key={cell.id} 
                          className={`px-4 py-3 text-sm ${isTextColumn ? '' : 'whitespace-nowrap'}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <p className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

