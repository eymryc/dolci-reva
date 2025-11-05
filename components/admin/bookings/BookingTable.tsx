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
import { Booking } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MoreVertical,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingTableProps {
  data: Booking[];
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function BookingTable({
  data,
  onCancel,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: BookingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<Booking>[]>(
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
        accessorKey: "booking_reference",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Référence
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
          <div className="font-mono text-sm font-semibold text-gray-900">{row.getValue("booking_reference")}</div>
        ),
      },
      {
        id: "customer",
        header: "Client",
        cell: ({ row }) => {
          const customer = row.original.customer;
          if (!customer) {
            return <div className="text-gray-500 text-sm">N/A</div>;
          }
          return (
            <div className="text-gray-900">
              <div className="font-medium">{`${customer.first_name} ${customer.last_name}`}</div>
              <div className="text-xs text-gray-500">{customer.email}</div>
            </div>
          );
        },
      },
      {
        id: "bookable",
        header: "Résidence",
        cell: ({ row }) => {
          const bookable = row.original.bookable;
          if (!bookable) {
            return <div className="text-gray-500 text-sm">N/A</div>;
          }
          return (
            <div className="text-gray-900">
              <div className="font-medium">{bookable.name}</div>
              <div className="text-xs text-gray-500">{bookable.address}</div>
            </div>
          );
        },
      },
      {
        id: "dates",
        header: "Dates",
        cell: ({ row }) => {
          const startDate = new Date(row.original.start_date).toLocaleDateString('fr-FR');
          const endDate = new Date(row.original.end_date).toLocaleDateString('fr-FR');
          return (
            <div className="text-gray-900">
              <div className="text-sm font-medium">{startDate} - {endDate}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "guests",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Invités
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
          <div className="text-gray-900 font-medium">{row.getValue("guests")}</div>
        ),
      },
      {
        accessorKey: "total_price",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Prix total
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
          const price = parseFloat(row.getValue("total_price"));
          return (
            <div className="text-gray-900 font-semibold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price)}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Statut
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
          const status = row.getValue("status") as string;
          const statusConfig = {
            CONFIRME: {
              bg: "bg-gradient-to-r from-green-100 to-emerald-100",
              text: "text-green-700",
              border: "border-green-200/50",
              dot: "bg-green-500",
              label: "Confirmé",
            },
            ANNULE: {
              bg: "bg-gradient-to-r from-red-100 to-rose-100",
              text: "text-red-700",
              border: "border-red-200/50",
              dot: "bg-red-500",
              label: "Annulé",
            },
            EN_ATTENTE: {
              bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
              text: "text-yellow-700",
              border: "border-yellow-200/50",
              dot: "bg-yellow-500",
              label: "En attente",
            },
            TERMINE: {
              bg: "bg-gradient-to-r from-blue-100 to-indigo-100",
              text: "text-blue-700",
              border: "border-blue-200/50",
              dot: "bg-blue-500",
              label: "Terminé",
            },
          };
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_ATTENTE;

          return (
            <Badge
              className={`${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "Paiement",
        cell: ({ row }) => {
          const paymentStatus = row.getValue("payment_status") as string;
          const paymentConfig = {
            PAYE: {
              bg: "bg-gradient-to-r from-green-100 to-emerald-100",
              text: "text-green-700",
              border: "border-green-200/50",
              dot: "bg-green-500",
              label: "Payé",
            },
            EN_ATTENTE: {
              bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
              text: "text-yellow-700",
              border: "border-yellow-200/50",
              dot: "bg-yellow-500",
              label: "En attente",
            },
            REFUSE: {
              bg: "bg-gradient-to-r from-red-100 to-rose-100",
              text: "text-red-700",
              border: "border-red-200/50",
              dot: "bg-red-500",
              label: "Refusé",
            },
            REMBOURSE: {
              bg: "bg-gradient-to-r from-blue-100 to-indigo-100",
              text: "text-blue-700",
              border: "border-blue-200/50",
              dot: "bg-blue-500",
              label: "Remboursé",
            },
          };
          const config = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.EN_ATTENTE;

          return (
            <Badge
              className={`${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
              {config.label}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const booking = row.original;
          const isCancelled = booking.status === 'ANNULE';
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onCancel(booking)}
                  disabled={isCancelled}
                  className="cursor-pointer"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Annuler
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(booking)}
                  variant="destructive"
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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
    [onCancel, onDelete]
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher une réservation..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 bg-white h-12"
          />
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="xl"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="hover:bg-gray-100"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
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
                    Chargement des réservations...
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
                    Aucune réservation trouvée.
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

