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
  Loader2,
} from "lucide-react";
import { RefreshButton } from "@/components/admin/shared/RefreshButton";
import { useIsHostView } from "@/hooks/use-host-view";
import { HostShell } from "@/components/admin/host/HostShell";
import { WithdrawRequestPanel } from "@/components/admin/payout/WithdrawRequestPanel";
import { AdminFinanceConsole } from "@/components/admin/finance/AdminFinanceConsole";
import { usePermissions } from "@/hooks/use-permissions";

export default function OperationsPage() {
  const isHostView = useIsHostView();
  const { isAnyAdmin } = usePermissions();
  const isAdminFinance = isAnyAdmin() && !isHostView;

  if (isAdminFinance) {
    return <AdminFinanceConsole />;
  }

  return <HostOperationsPage isHostView={isHostView} />;
}

function HostOperationsPage({ isHostView }: { isHostView: boolean }) {
  const [activeTab, setActiveTab] = useState("retrait");
  const [depotsPage, setDepotsPage] = useState(1);
  const [retraitPage, setRetraitPage] = useState(1);
  const [depotsSorting, setDepotsSorting] = useState<SortingState>([]);
  const [retraitSorting, setRetraitSorting] = useState<SortingState>([]);
  const [depotsGlobalFilter, setDepotsGlobalFilter] = useState("");
  const [retraitGlobalFilter, setRetraitGlobalFilter] = useState("");

  const {
    data: depotsResponse,
    isLoading: isLoadingDepots,
    refetch: refetchDepots,
    isRefetching: isRefreshingDepots,
  } = useWalletTransactions(depotsPage, TransactionCategory.RECHARGE);

  const {
    data: retraitResponse,
    isLoading: isLoadingRetrait,
    refetch: refetchRetrait,
    isRefetching: isRefreshingRetrait,
  } = useWalletTransactions(retraitPage, TransactionCategory.WITHDRAWAL);

  const depots = depotsResponse?.data || [];
  const retraits = retraitResponse?.data || [];

  const moneyColumn = useMemo<ColumnDef<Transaction>[]>(
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 hover:bg-transparent"
          >
            Montant
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-3.5 w-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "XOF",
              maximumFractionDigits: 0,
            }).format(Number(row.original.amount) || 0)}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        header: "Motif",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">{row.original.reason}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleString("fr-FR")
              : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const depotsTable = useReactTable({
    data: depots,
    columns: moneyColumn,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setDepotsSorting,
    onGlobalFilterChange: setDepotsGlobalFilter,
    state: { sorting: depotsSorting, globalFilter: depotsGlobalFilter },
    manualPagination: true,
    pageCount: depotsResponse?.meta?.last_page || 0,
  });

  const retraitTable = useReactTable({
    data: retraits,
    columns: moneyColumn,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setRetraitSorting,
    onGlobalFilterChange: setRetraitGlobalFilter,
    state: { sorting: retraitSorting, globalFilter: retraitGlobalFilter },
    manualPagination: true,
    pageCount: retraitResponse?.meta?.last_page || 0,
  });

  const content = (
    <div className={isHostView ? "mx-auto max-w-6xl space-y-6" : "space-y-6"}>
      {isHostView ? (
        <header className="relative overflow-hidden border border-[#f08400]/25 bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white px-5 py-6 sm:px-7">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] to-[#ffb347]"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
            Espace hôte
          </p>
          <h1 className="mt-2 text-[1.85rem] font-semibold tracking-tight text-slate-900 sm:text-[2.2rem]">
            Portefeuille
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">
            Consultez vos gains libérés et demandez un versement.
          </p>
        </header>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-6 px-6 pb-4 pt-6">
            <TabsList className="inline-flex h-auto gap-0 bg-transparent p-0">
              <TabsTrigger
                value="depots"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-[#f08400] data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400]"
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Gains
              </TabsTrigger>
              <TabsTrigger
                value="retrait"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-[#f08400] data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400]"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Retrait
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300" />
          </div>

          <TabsContent value="depots" className="space-y-6 px-6 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher…"
                  value={depotsGlobalFilter}
                  onChange={(e) => setDepotsGlobalFilter(e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <RefreshButton
                onClick={() => refetchDepots()}
                isRefreshing={isRefreshingDepots}
                showLabel={false}
              />
            </div>
            <LedgerTable
              table={depotsTable}
              columnsLength={moneyColumn.length}
              isLoading={isLoadingDepots}
              page={depotsPage}
              setPage={setDepotsPage}
              response={depotsResponse}
            />
          </TabsContent>

          <TabsContent value="retrait" className="space-y-6 px-6 pb-6">
            <WithdrawRequestPanel />
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher dans le ledger…"
                  value={retraitGlobalFilter}
                  onChange={(e) => setRetraitGlobalFilter(e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <RefreshButton
                onClick={() => refetchRetrait()}
                isRefreshing={isRefreshingRetrait}
                showLabel={false}
              />
            </div>
            <LedgerTable
              table={retraitTable}
              columnsLength={moneyColumn.length}
              isLoading={isLoadingRetrait}
              page={retraitPage}
              setPage={setRetraitPage}
              response={retraitResponse}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (isHostView) {
    return <HostShell>{content}</HostShell>;
  }
  return content;
}

function LedgerTable({
  table,
  columnsLength,
  isLoading,
  page,
  setPage,
  response,
}: {
  table: ReturnType<typeof useReactTable<Transaction>>;
  columnsLength: number;
  isLoading: boolean;
  page: number;
  setPage: (n: number) => void;
  response?: { meta?: { current_page?: number; last_page?: number } };
}) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-700 sm:px-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={columnsLength} className="px-6 py-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#f08400]" />
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-3 py-1.5 sm:px-6"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columnsLength}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page === 1 || isLoading}
          onClick={() => {
            setPage(1);
            table.setPageIndex(0);
          }}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page === 1 || isLoading}
          onClick={() => {
            const newPage = Math.max(1, page - 1);
            setPage(newPage);
            table.previousPage();
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs text-gray-600">
          Page {response?.meta?.current_page || 1} /{" "}
          {response?.meta?.last_page || 0}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page >= (response?.meta?.last_page || 1) || isLoading}
          onClick={() => {
            const newPage = Math.min(
              response?.meta?.last_page || 1,
              page + 1
            );
            setPage(newPage);
            table.nextPage();
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page >= (response?.meta?.last_page || 1) || isLoading}
          onClick={() => {
            const lastPage = response?.meta?.last_page || 1;
            setPage(lastPage);
            table.setPageIndex(lastPage - 1);
          }}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
