/**
 * Composant DataTable générique pour afficher des données tabulaires
 * 
 * Ce composant encapsule toute la logique commune des tables (tri, filtrage, pagination)
 * et permet la personnalisation via les colonnes et les callbacks.
 * 
 * @example
 * ```tsx
 * <DataTable
 *   data={residences}
 *   columns={columns}
 *   isLoading={isLoading}
 *   onRefresh={refetch}
 *   addButton={<Button>Ajouter</Button>}
 * />
 * ```
 */

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
  type TableOptions,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";

export interface DataTableProps<TData> {
  /**
   * Données à afficher dans la table
   */
  data: TData[];
  
  /**
   * Définitions des colonnes de la table
   */
  columns: ColumnDef<TData>[];
  
  /**
   * Indique si les données sont en cours de chargement
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Bouton à afficher à côté de la barre de recherche (ex: bouton "Ajouter")
   */
  addButton?: React.ReactNode;
  
  /**
   * Callback appelé lors du clic sur le bouton de rafraîchissement
   */
  onRefresh?: () => void;
  
  /**
   * Indique si le rafraîchissement est en cours
   * @default false
   */
  isRefreshing?: boolean;
  
  /**
   * Placeholder pour la barre de recherche
   * @default "Rechercher..."
   */
  searchPlaceholder?: string;
  
  /**
   * Taille de page par défaut
   * @default 10
   */
  pageSize?: number;
  
  /**
   * Active la sélection de lignes
   * @default true
   */
  enableRowSelection?: boolean;
  
  /**
   * Options supplémentaires pour la table React Table
   */
  tableOptions?: Partial<TableOptions<TData>>;
  
  /**
   * Message à afficher lorsqu'il n'y a pas de données
   * @default "Aucune donnée"
   */
  emptyMessage?: string;
  
  /**
   * Classe CSS personnalisée pour le conteneur
   */
  className?: string;
}

/**
 * Composant DataTable générique
 * 
 * @template TData - Type des données de la table
 */
export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
  searchPlaceholder = "Rechercher...",
  pageSize = 10,
  enableRowSelection = true,
  tableOptions = {},
  emptyMessage = "Aucune donnée",
  className = "",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Ajouter la colonne de sélection si activée
  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!enableRowSelection) {
      return columns;
    }

    // Vérifier si une colonne de sélection existe déjà
    const hasSelectColumn = columns.some((col) => col.id === "select");
    if (hasSelectColumn) {
      return columns;
    }

    // Ajouter la colonne de sélection
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Sélectionner tout"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable<TData>({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    enableRowSelection,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    ...tableOptions,
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search 
            className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" 
            aria-hidden="true"
          />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 sm:pl-10 bg-white h-8 sm:h-9 lg:h-12 text-xs sm:text-sm"
            aria-label="Rechercher dans la table"
          />
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 sm:h-9 lg:h-10 hover:bg-gray-100"
              title="Actualiser les données"
              aria-label="Actualiser les données"
            >
              <RefreshCw 
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? "animate-spin" : ""}`} 
                aria-hidden="true"
              />
            </Button>
          )}
          {addButton && <div className="flex-shrink-0">{addButton}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Tableau de données">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
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
              {isLoading ? (
                <tr>
                  <td 
                    colSpan={tableColumns.length} 
                    className="px-3 sm:px-6 py-6 sm:py-8 text-center"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" aria-hidden="true" />
                      <span className="sr-only">Chargement des données...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200"
                    aria-selected={row.getIsSelected()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        className="px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={tableColumns.length} 
                    className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && table.getRowModel().rows?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          {enableRowSelection && (
            <div className="text-xs sm:text-sm text-gray-600">
              {selectedRowsCount > 0 && (
                <span>
                  {selectedRowsCount} sur {totalRowsCount} ligne(s) sélectionnée(s).
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
              aria-label="Première page"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="text-xs sm:text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount() || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
              aria-label="Dernière page"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

