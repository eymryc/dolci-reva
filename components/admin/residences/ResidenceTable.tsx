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
import { Residence } from "@/hooks/use-residences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ActionButtons } from "@/components/admin/shared/ActionButtons";
import { RefreshButton } from "@/components/admin/shared/RefreshButton";

interface ResidenceTableProps {
  data: Residence[];
  onEdit: (residence: Residence) => void;
  onDelete: (residence: Residence) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ResidenceTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: ResidenceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<Residence>[]>(
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
        id: "address",
        header: "Adresse",
        cell: ({ row }) => {
          const residence = row.original;
          return (
            <div className="text-gray-600">
              <div className="font-medium">{residence.address}</div>
              <div className="text-xs text-gray-500">{residence.city}, {residence.country}</div>
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
        accessorKey: "standing",
        header: "Standing",
        cell: ({ row }) => {
          const standing = row.getValue("standing") as string;
          const standingConfig: Record<string, { label: string; className: string }> = {
            STANDARD: { label: "Standard", className: "bg-gray-100 text-gray-700 border-gray-200/50" },
            SUPERIEUR: { label: "Supérieur", className: "bg-blue-100 text-blue-700 border-blue-200/50" },
            DELUXE: { label: "Deluxe", className: "bg-purple-100 text-purple-700 border-purple-200/50" },
            EXECUTIVE: { label: "Executive", className: "bg-indigo-100 text-indigo-700 border-indigo-200/50" },
            SUITE: { label: "Suite", className: "bg-pink-100 text-pink-700 border-pink-200/50" },
            SUITE_JUNIOR: { label: "Suite Junior", className: "bg-rose-100 text-rose-700 border-rose-200/50" },
            SUITE_EXECUTIVE: { label: "Suite Executive", className: "bg-amber-100 text-amber-700 border-amber-200/50" },
            SUITE_PRESIDENTIELLE: { label: "Suite Présidentielle", className: "bg-yellow-100 text-yellow-700 border-yellow-200/50" },
          };
          const config = standingConfig[standing] || { label: standing, className: "bg-gray-100 text-gray-700 border-gray-200/50" };
          return (
            <Badge className={config.className + " border"}>
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Prix
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
          const price = row.getValue("price") as string;
          const priceNum = parseFloat(price);
          return (
            <div className="text-gray-600 font-medium">
              {priceNum > 0 ? `${priceNum.toLocaleString()} FCFA` : <span className="text-gray-400 italic">Gratuit</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "max_guests",
        header: "Invités max",
        cell: ({ row }) => {
          const maxGuests = row.getValue("max_guests") as number;
          return (
            <div className="text-gray-600 font-medium">
              {maxGuests} {maxGuests > 1 ? "personnes" : "personne"}
            </div>
          );
        },
      },
      {
        accessorKey: "is_available",
        header: "Disponibilité",
        cell: ({ row }) => {
          const isAvailable = row.getValue("is_available") as boolean;
          return isAvailable ? (
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50">
              Disponible
            </Badge>
          ) : (
            <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50">
              Indisponible
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const residence = row.original;
          return (
            <ActionButtons
              onEdit={() => onEdit(residence)}
              onDelete={() => onDelete(residence)}
            />
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une résidence..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <RefreshButton
              onClick={onRefresh}
              isRefreshing={isRefreshing}
              showLabel={false}
            />
          )}
          {addButton && <div className="flex-shrink-0">{addButton}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Chargement des résidences...
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-1 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Affichage de {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
          à{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          de {table.getFilteredRowModel().rows.length} résultats
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

