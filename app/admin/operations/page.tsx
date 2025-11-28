"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Transaction,
  useWalletTransactions,
  TransactionCategory,
} from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("depots");
  const [depotsPage, setDepotsPage] = useState(1);
  const [retraitPage, setRetraitPage] = useState(1);
  const [depotsSorting, setDepotsSorting] = useState<SortingState>([]);
  const [retraitSorting, setRetraitSorting] = useState<SortingState>([]);
  const [depotsGlobalFilter, setDepotsGlobalFilter] = useState("");
  const [retraitGlobalFilter, setRetraitGlobalFilter] = useState("");

  // Dépôts (RECHARGE)
  const {
    data: depotsResponse,
    isLoading: isLoadingDepots,
    refetch: refetchDepots,
    isRefetching: isRefreshingDepots,
  } = useWalletTransactions(depotsPage, TransactionCategory.RECHARGE);

  // Retrait (WITHDRAWAL)
  const {
    data: retraitResponse,
    isLoading: isLoadingRetrait,
    refetch: refetchRetrait,
    isRefetching: isRefreshingRetrait,
  } = useWalletTransactions(retraitPage, TransactionCategory.WITHDRAWAL);

  const depots = depotsResponse?.data || [];
  const retraits = retraitResponse?.data || [];

  const depotsColumns = useMemo<ColumnDef<Transaction>[]>(
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
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Montant
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
          const amount = parseFloat(row.getValue("amount") as string);
          return (
            <div className="font-semibold text-sm">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "XOF",
                maximumFractionDigits: 0,
              }).format(amount)}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Date
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
          const date = new Date(row.getValue("created_at") as string);
          return (
            <div className="text-sm text-gray-600">
              {date.toLocaleString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          );
        },
      },
    ],
    []
  );

  const retraitColumns = useMemo<ColumnDef<Transaction>[]>(
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
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Montant
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
          const amount = parseFloat(row.getValue("amount") as string);
          return (
            <div className="font-semibold text-sm">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "XOF",
                maximumFractionDigits: 0,
              }).format(amount)}
            </div>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "Compte",
        cell: ({ row }) => {
          const reason = row.getValue("reason") as string;
          return (
            <div className="text-sm text-gray-600 max-w-xs truncate" title={reason}>
              {reason || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Date
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
          const date = new Date(row.getValue("created_at") as string);
          return (
            <div className="text-sm text-gray-600">
              {date.toLocaleString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          );
        },
      },
    ],
    []
  );

  const depotsTable = useReactTable({
    data: depots,
    columns: depotsColumns,
    onSortingChange: setDepotsSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setDepotsGlobalFilter,
    globalFilterFn: "includesString",
    enableRowSelection: true,
    state: {
      sorting: depotsSorting,
      globalFilter: depotsGlobalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    manualPagination: true,
    pageCount: depotsResponse?.meta?.last_page || 0,
  });

  const retraitTable = useReactTable({
    data: retraits,
    columns: retraitColumns,
    onSortingChange: setRetraitSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setRetraitGlobalFilter,
    globalFilterFn: "includesString",
    enableRowSelection: true,
    state: {
      sorting: retraitSorting,
      globalFilter: retraitGlobalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    manualPagination: true,
    pageCount: retraitResponse?.meta?.last_page || 0,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] mb-2">
            Mes opérations
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Gérez vos dépôts et retraits
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-6 pb-4 px-6 pt-6">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="depots"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Dépôts
              </TabsTrigger>
              <TabsTrigger
                value="retrait"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Retrait
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Dépôts Tab */}
          <TabsContent value="depots" className="space-y-6 px-6 pb-6">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={depotsGlobalFilter}
                  onChange={(e) => setDepotsGlobalFilter(e.target.value)}
                  className="pl-8 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchDepots()}
                disabled={isRefreshingDepots}
                className="h-9 sm:h-10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingDepots ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    {depotsTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider"
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
                    {isLoadingDepots ? (
                      <tr>
                        <td colSpan={depotsColumns.length} className="px-3 sm:px-6 py-6 sm:py-8 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
                          </div>
                        </td>
                      </tr>
                    ) : depotsTable.getRowModel().rows?.length ? (
                      depotsTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 whitespace-nowrap">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={depotsColumns.length} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                          Aucune donnée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
              <div className="text-xs sm:text-sm text-gray-600">
                {depotsTable.getFilteredSelectedRowModel().rows.length} sur{" "}
                {depotsTable.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDepotsPage(1);
                    depotsTable.setPageIndex(0);
                  }}
                  disabled={depotsPage === 1 || isLoadingDepots}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, depotsPage - 1);
                    setDepotsPage(newPage);
                    depotsTable.previousPage();
                  }}
                  disabled={depotsPage === 1 || isLoadingDepots}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs sm:text-sm text-gray-600">
                  Page {depotsResponse?.meta?.current_page || 1} sur{" "}
                  {depotsResponse?.meta?.last_page || 0}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(depotsResponse?.meta?.last_page || 1, depotsPage + 1);
                    setDepotsPage(newPage);
                    depotsTable.nextPage();
                  }}
                  disabled={
                    depotsPage >= (depotsResponse?.meta?.last_page || 1) || isLoadingDepots
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastPage = depotsResponse?.meta?.last_page || 1;
                    setDepotsPage(lastPage);
                    depotsTable.setPageIndex(lastPage - 1);
                  }}
                  disabled={
                    depotsPage >= (depotsResponse?.meta?.last_page || 1) || isLoadingDepots
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Retrait Tab */}
          <TabsContent value="retrait" className="space-y-6 px-6 pb-6">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={retraitGlobalFilter}
                  onChange={(e) => setRetraitGlobalFilter(e.target.value)}
                  className="pl-8 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRetrait()}
                disabled={isRefreshingRetrait}
                className="h-9 sm:h-10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingRetrait ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    {retraitTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider"
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
                    {isLoadingRetrait ? (
                      <tr>
                        <td colSpan={retraitColumns.length} className="px-3 sm:px-6 py-6 sm:py-8 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
                          </div>
                        </td>
                      </tr>
                    ) : retraitTable.getRowModel().rows?.length ? (
                      retraitTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 whitespace-nowrap">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={retraitColumns.length} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                          Aucune donnée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
              <div className="text-xs sm:text-sm text-gray-600">
                {retraitTable.getFilteredSelectedRowModel().rows.length} sur{" "}
                {retraitTable.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRetraitPage(1);
                    retraitTable.setPageIndex(0);
                  }}
                  disabled={retraitPage === 1 || isLoadingRetrait}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, retraitPage - 1);
                    setRetraitPage(newPage);
                    retraitTable.previousPage();
                  }}
                  disabled={retraitPage === 1 || isLoadingRetrait}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs sm:text-sm text-gray-600">
                  Page {retraitResponse?.meta?.current_page || 1} sur{" "}
                  {retraitResponse?.meta?.last_page || 0}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(retraitResponse?.meta?.last_page || 1, retraitPage + 1);
                    setRetraitPage(newPage);
                    retraitTable.nextPage();
                  }}
                  disabled={
                    retraitPage >= (retraitResponse?.meta?.last_page || 1) || isLoadingRetrait
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastPage = retraitResponse?.meta?.last_page || 1;
                    setRetraitPage(lastPage);
                    retraitTable.setPageIndex(lastPage - 1);
                  }}
                  disabled={
                    retraitPage >= (retraitResponse?.meta?.last_page || 1) || isLoadingRetrait
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
