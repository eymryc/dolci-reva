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
import { Visit } from "@/hooks/use-visits";
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
  RefreshCw,
  Calendar,
  MapPin,
  User,
} from "lucide-react";

interface VisitTableProps {
  data: Visit[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: {
      bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
      text: "text-yellow-700",
      border: "border-yellow-200/50",
      dot: "bg-yellow-500",
      label: "En attente",
    },
    CONFIRMED: {
      bg: "bg-gradient-to-r from-green-100 to-emerald-100",
      text: "text-green-700",
      border: "border-green-200/50",
      dot: "bg-green-500",
      label: "Confirmée",
    },
    CANCELLED: {
      bg: "bg-gradient-to-r from-red-100 to-rose-100",
      text: "text-red-700",
      border: "border-red-200/50",
      dot: "bg-red-500",
      label: "Annulée",
    },
    COMPLETED: {
      bg: "bg-gradient-to-r from-blue-100 to-indigo-100",
      text: "text-blue-700",
      border: "border-blue-200/50",
      dot: "bg-blue-500",
      label: "Terminée",
    },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <Badge
      className={`${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
      {config.label}
    </Badge>
  );
};

export function VisitTable({
  data,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: VisitTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<Visit>[]>(
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
        accessorKey: "visit_reference",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-7 sm:h-8 px-1.5 sm:px-2 hover:bg-transparent text-xs sm:text-sm"
            >
              Référence
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-1.5 h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-1.5 h-3 w-3" />
              ) : (
                <ArrowUpDown className="ml-1.5 h-3 w-3" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const visit = row.original;
          return (
            <button
              onClick={() => {
                window.location.href = `/admin/hebergements/visits/${visit.id}`;
              }}
              className="font-medium text-xs sm:text-sm text-[#f08400] hover:text-[#d87200] hover:underline transition-colors"
            >
              {row.getValue("visit_reference")}
            </button>
          );
        },
      },
      {
        accessorKey: "dwelling",
        header: "Hébergement",
        cell: ({ row }) => {
          const dwelling = row.original.dwelling;
          return (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div className="text-xs sm:text-sm">
                <div className="font-medium">{dwelling.address}</div>
                <div className="text-gray-500 text-xs">{dwelling.city}, {dwelling.country}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "visitor",
        header: "Visiteur",
        cell: ({ row }) => {
          const visitor = row.original.visitor;
          if (!visitor) {
            return <span className="text-gray-400 text-xs sm:text-sm">-</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div className="text-xs sm:text-sm">
                <div className="font-medium">{visitor.first_name} {visitor.last_name}</div>
                <div className="text-gray-500 text-xs">{visitor.email}</div>
                {visitor.phone && (
                  <div className="text-gray-500 text-xs">{visitor.phone}</div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "scheduled_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-7 sm:h-8 px-1.5 sm:px-2 hover:bg-transparent text-xs sm:text-sm"
            >
              Date prévue
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-1.5 h-3 w-3" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-1.5 h-3 w-3" />
              ) : (
                <ArrowUpDown className="ml-1.5 h-3 w-3" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("scheduled_at"));
          return (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium">
                  {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div className="text-gray-500 text-xs">
                  {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          return getStatusBadge(row.getValue("status"));
        },
      },
    ],
    []
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
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 sm:h-10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-gray-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08400]"></div>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 sm:p-4 align-middle text-xs sm:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-gray-500 text-sm">
                  Aucune visite trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="text-xs sm:text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs sm:text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

