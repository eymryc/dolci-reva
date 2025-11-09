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
} from "@tanstack/react-table";
import { OwnerVerification, VerificationStatus, VerificationLevel } from "@/hooks/use-owner-verifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationTableProps {
  data: OwnerVerification[];
  onView: (verification: OwnerVerification) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const getStatusBadge = (status: VerificationStatus) => {
  const statusConfig = {
    PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    SUBMITTED: { label: "Soumis", className: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
    UNDER_REVIEW: { label: "En révision", className: "bg-purple-100 text-purple-800 border-purple-200", icon: AlertCircle },
    APPROVED: { label: "Approuvé", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
    REJECTED: { label: "Rejeté", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
    SUSPENDED: { label: "Suspendu", className: "bg-gray-100 text-gray-800 border-gray-200", icon: ShieldOff },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

const getLevelBadge = (level: VerificationLevel | null) => {
  if (!level) return <span className="text-gray-500 text-xs">Non certifié</span>;

  const levelConfig = {
    BRONZE: { label: "🥉 Bronze", className: "bg-amber-100 text-amber-800 border-amber-200" },
    SILVER: { label: "🥈 Argent", className: "bg-gray-100 text-gray-800 border-gray-200" },
    GOLD: { label: "🥇 Or", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    PREMIUM: { label: "💎 Premium", className: "bg-purple-100 text-purple-800 border-purple-200" },
  };

  const config = levelConfig[level] || levelConfig.BRONZE;

  return (
    <Badge className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
};

export function VerificationTable({
  data,
  onView,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: VerificationTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<OwnerVerification>[]>(
    () => [
      {
        accessorKey: "user",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Propriétaire
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
          const user = row.original.user;
          if (!user) return <span className="text-gray-500">N/A</span>;
          return (
            <div>
              <div className="font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "verification_status",
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
        cell: ({ row }) => getStatusBadge(row.original.verification_status),
      },
      {
        accessorKey: "verification_level",
        header: "Niveau",
        cell: ({ row }) => getLevelBadge(row.original.verification_level),
      },
      {
        accessorKey: "reputation_score",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Score
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
          const score = row.original.reputation_score;
          const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
          return (
            <div className={`font-semibold ${color}`}>
              {score}/100
            </div>
          );
        },
      },
      {
        accessorKey: "total_bookings",
        header: "Réservations",
        cell: ({ row }) => {
          const total = row.original.total_bookings;
          const cancelled = row.original.cancelled_bookings;
          const rate = row.original.cancellation_rate;
          return (
            <div>
              <div className="font-medium text-gray-900">{total}</div>
              {cancelled > 0 && (
                <div className="text-xs text-red-600">
                  {cancelled} annulées ({rate.toFixed(1)}%)
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "phone_verified",
        header: "Téléphone",
        cell: ({ row }) => {
          const verified = row.original.phone_verified;
          return verified ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Vérifié
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
              <XCircle className="w-3 h-3 mr-1" />
              Non vérifié
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const verification = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(verification)}
                className="hover:bg-blue-50 hover:text-blue-600"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onView]
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
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Refresh */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un propriétaire..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 bg-white h-12"
          />
        </div>
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
                    Chargement des vérifications...
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
                    Aucune vérification trouvée.
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

