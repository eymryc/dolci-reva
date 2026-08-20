"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { User } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshButton } from "@/components/admin/shared/RefreshButton";
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
  Star,
  Shield,
  MoreVertical,
  Eye,
  Copy,
  UserCog,
  Ban,
  Briefcase,
} from "lucide-react";

function BusinessTypesCell({
  businessTypes,
}: {
  businessTypes: { id: number; name: string }[];
}) {
  // Dédupliquer par nom (évite RÉSIDENCE x2)
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return businessTypes.filter((bt) => {
      const key = bt.name.trim().toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [businessTypes]);

  if (unique.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex max-w-[7.5rem] items-center gap-1 border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-[#c56a00] transition-colors hover:bg-orange-100"
          aria-label={`${unique.length} types de business`}
        >
          <Briefcase className="h-3 w-3 shrink-0" />
          <span className="truncate">{unique.length}</span>
          <span className="hidden shrink-0 sm:inline">type{unique.length > 1 ? "s" : ""}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-50 w-52 rounded-none p-2">
        <DropdownMenuLabel className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          <Briefcase className="h-3 w-3 text-[#f08400]" />
          {unique.length} types business
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex max-h-48 flex-wrap gap-1 overflow-y-auto px-1 py-1">
          {unique.map((bt) => (
            <span
              key={bt.id}
              className="border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#c56a00]"
            >
              {bt.name}
            </span>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function UserTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: UserTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<User>[]>(
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
        size: 40,
      },
      {
        id: "user",
        accessorFn: (row) => `${row.first_name} ${row.last_name} ${row.email}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-0 hover:bg-transparent"
          >
            Utilisateur
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
            className="group flex max-w-[220px] flex-col items-start text-left"
          >
            <span className="truncate font-semibold text-slate-900 group-hover:text-[#f08400]">
              {row.original.first_name} {row.original.last_name}
            </span>
            <span className="w-full truncate text-[11px] text-slate-500">{row.original.email}</span>
          </button>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          const typeMap: Record<string, { label: string; className: string }> = {
            SUPER_ADMIN: { label: "Super Admin", className: "border-red-200 bg-red-50 text-red-700" },
            ADMIN: { label: "Admin", className: "border-violet-200 bg-violet-50 text-violet-700" },
            OWNER: { label: "Propriétaire", className: "border-sky-200 bg-sky-50 text-sky-700" },
            CUSTOMER: { label: "Client", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
          };
          const info = typeMap[type] || { label: type, className: "border-slate-200 bg-slate-50 text-slate-600" };
          return (
            <span className={`inline-flex border px-2 py-0.5 text-[10px] font-bold ${info.className}`}>
              {info.label}
            </span>
          );
        },
      },
      {
        accessorKey: "verification_status",
        header: "Vérif.",
        cell: ({ row }) => {
          const status = row.original.verification_status;
          if (!status) {
            return <span className="text-[10px] text-slate-400">—</span>;
          }
          const statusMap: Record<string, { label: string; className: string }> = {
            PENDING: { label: "Attente", className: "border-amber-200 bg-amber-50 text-amber-700" },
            SUBMITTED: { label: "Soumis", className: "border-sky-200 bg-sky-50 text-sky-700" },
            UNDER_REVIEW: { label: "Revue", className: "border-violet-200 bg-violet-50 text-violet-700" },
            APPROVED: { label: "OK", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            VERIFIED: { label: "OK", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            REJECTED: { label: "Rejeté", className: "border-red-200 bg-red-50 text-red-700" },
            SUSPENDED: { label: "Suspendu", className: "border-slate-200 bg-slate-50 text-slate-600" },
          };
          const info = statusMap[status] || {
            label: status,
            className: "border-slate-200 bg-slate-50 text-slate-600",
          };
          return (
            <span className={`inline-flex border px-2 py-0.5 text-[10px] font-bold ${info.className}`}>
              {info.label}
            </span>
          );
        },
      },
      {
        id: "businessTypes",
        header: "Business",
        cell: ({ row }) => (
          <BusinessTypesCell businessTypes={row.original.businessTypes || []} />
        ),
      },
      {
        accessorKey: "is_premium",
        header: "Premium",
        cell: ({ row }) =>
          row.original.is_premium ? (
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
          ) : (
            <Star className="h-4 w-4 text-slate-300" />
          ),
      },
      {
        id: "permissions",
        header: "Perm.",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            {(row.original.permissions || []).length}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user.email);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copier l&apos;email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}?tab=permissions`)}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Gérer les permissions
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Vérifier le compte
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspendre
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, router]
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
    <div className="space-y-4 min-w-0">
      {/* Search and Add Button */}
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0 flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
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
      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200/50">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-12" />
            </colgroup>
            <thead className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-700 sm:px-3"
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
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="overflow-hidden px-2 py-2 align-middle sm:px-3">
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

