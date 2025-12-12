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
  CheckCircle2,
  XCircle,
  Star,
  Shield,
  MoreVertical,
  Eye,
  Copy,
  UserCog,
  Ban,
} from "lucide-react";

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
      },
      {
        accessorKey: "first_name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Prénom
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
          <button
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
            className="font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer text-left"
          >
            {row.original.first_name}
          </button>
        ),
      },
      {
        accessorKey: "last_name",
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
          <button
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
            className="font-medium text-purple-700 hover:text-purple-900 hover:underline cursor-pointer text-left"
          >
            {row.original.last_name}
          </button>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Email
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
          <div className="text-gray-700 font-medium">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Téléphone",
        cell: ({ row }) => (
          <div className="text-gray-600">{row.getValue("phone")}</div>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Type
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
          const type = row.getValue("type") as string;
          const typeMap: Record<string, { label: string; color: string; bg: string }> = {
            SUPER_ADMIN: { label: "Super Admin", color: "text-red-700", bg: "bg-red-100 border-red-200" },
            ADMIN: { label: "Admin", color: "text-purple-700", bg: "bg-purple-100 border-purple-200" },
            OWNER: { label: "Propriétaire", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
            CUSTOMER: { label: "Client", color: "text-green-700", bg: "bg-green-100 border-green-200" },
          };
          const typeInfo = typeMap[type] || { label: type, color: "text-gray-700", bg: "bg-gray-100 border-gray-200" };
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeInfo.bg} ${typeInfo.color}`}
            >
              {typeInfo.label}
            </span>
          );
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Rôle
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
          const role = row.getValue("role") as string;
          return (
            <div className="text-gray-700 font-medium text-sm">{role}</div>
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
              Statut Vérif.
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
          const status = row.original.verification_status;
          const statusMap: Record<string, { label: string; color: string; bg: string }> = {
            PENDING: { label: "En attente", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-200" },
            SUBMITTED: { label: "Soumis", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
            VERIFIED: { label: "Vérifié", color: "text-green-700", bg: "bg-green-100 border-green-200" },
            REJECTED: { label: "Rejeté", color: "text-red-700", bg: "bg-red-100 border-red-200" },
          };
          const statusInfo = statusMap[status || "PENDING"] || { label: status || "N/A", color: "text-gray-700", bg: "bg-gray-100 border-gray-200" };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          );
        },
      },
      {
        accessorKey: "verification_level",
        header: "Niveau Vérif.",
        cell: ({ row }) => {
          const level = row.original.verification_level;
          return (
            <div className="text-gray-600 text-sm">{level || "N/A"}</div>
          );
        },
      },
      {
        accessorKey: "phone_verified",
        header: "Tél. Vérifié",
        cell: ({ row }) => {
          const verified = row.original.phone_verified;
          return (
            <div className="flex items-center gap-1">
              {verified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm">Oui</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 text-sm">Non</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_verified",
        header: "Vérifié",
        cell: ({ row }) => {
          const verified = row.original.is_verified;
          return (
            <div className="flex items-center gap-1">
              {verified ? (
                <>
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm">Oui</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 text-sm">Non</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_premium",
        header: "Premium",
        cell: ({ row }) => {
          const premium = row.original.is_premium;
          return (
            <div className="flex items-center gap-1">
              {premium ? (
                <>
                  <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                  <span className="text-yellow-600 text-sm">Oui</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 text-sm">Non</span>
                </>
              )}
            </div>
          );
        },
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
          return (
            <div className="text-gray-700 font-medium text-sm">
              {score ? parseFloat(score).toFixed(2) : "0.00"}
            </div>
          );
        },
      },
      {
        accessorKey: "total_bookings",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Réservations
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
          const bookings = row.original.total_bookings || 0;
          return (
            <div className="text-gray-700 font-medium text-sm">{bookings}</div>
          );
        },
      },
      {
        accessorKey: "cancellation_rate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Taux Annul.
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
          const rate = row.original.cancellation_rate;
          const rateValue = rate ? parseFloat(rate) : 0;
          return (
            <div className={`font-medium text-sm ${rateValue > 10 ? "text-red-600" : rateValue > 5 ? "text-yellow-600" : "text-green-600"}`}>
              {rateValue.toFixed(2)}%
            </div>
          );
        },
      },
      {
        id: "businessTypes",
        header: "Types Business",
        cell: ({ row }) => {
          const businessTypes = row.original.businessTypes || [];
          return (
            <div className="flex flex-wrap gap-1">
              {businessTypes.length > 0 ? (
                businessTypes.map((bt) => (
                  <span
                    key={bt.id}
                    className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200"
                  >
                    {bt.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Aucun</span>
              )}
            </div>
          );
        },
      },
      {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
          const permissions = row.original.permissions || [];
          return (
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 text-sm font-medium">{permissions.length}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
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
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(user)}
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
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
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
                    Chargement des utilisateurs...
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

