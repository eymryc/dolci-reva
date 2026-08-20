"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types/entities/user.types";

const TYPE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OWNER: "Propriétaire",
  CUSTOMER: "Client",
};

interface UserHeaderProps {
  user: User;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function UserHeader({ user }: UserHeaderProps) {
  const router = useRouter();
  const first = user.first_name?.charAt(0) ?? "";
  const last = user.last_name?.charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase() || "?";
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Utilisateur";
  const emailVerified = Boolean(user.email_verified_at || user.email_verified);
  const identityStatus = user.verification_status?.toUpperCase();
  const identityApproved = identityStatus === "APPROVED" || Boolean(user.is_verified);
  const businessCount = user.businessTypes?.length ?? 0;
  const balance = Number(user.wallet?.balance ?? 0);

  const identityLabel = identityApproved
    ? "Approuvée"
    : identityStatus === "PENDING"
      ? "En attente"
      : identityStatus === "REJECTED"
        ? "Rejetée"
        : identityStatus === "SUSPENDED"
          ? "Suspendue"
          : "Non soumise";

  const rail = [
    {
      label: "Email",
      value: emailVerified ? "Vérifié" : "Non vérifié",
      tone: emailVerified ? "text-emerald-700" : "text-slate-500",
      dot: emailVerified ? "bg-emerald-500" : "bg-slate-300",
    },
    {
      label: "Identité",
      value: identityLabel,
      tone: identityApproved
        ? "text-emerald-700"
        : identityStatus === "REJECTED"
          ? "text-red-600"
          : identityStatus === "PENDING"
            ? "text-amber-700"
            : "text-slate-500",
      dot: identityApproved
        ? "bg-emerald-500"
        : identityStatus === "REJECTED"
          ? "bg-red-500"
          : identityStatus === "PENDING"
            ? "bg-amber-400"
            : "bg-slate-300",
    },
    {
      label: "Business",
      value: `${businessCount} type${businessCount !== 1 ? "s" : ""}`,
      tone: "text-slate-800",
      dot: "bg-slate-400",
    },
    {
      label: "Solde",
      value: formatMoney(balance),
      tone: "text-slate-800",
      dot: "bg-[#f08400]",
    },
  ];

  return (
    <header className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Utilisateurs
        </button>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-xl font-semibold tracking-tight text-slate-700 sm:h-20 sm:w-20 sm:text-2xl">
            {initials}
          </div>

          <div className="min-w-0 pt-0.5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {fullName}
              </h1>
              <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {TYPE_LABELS[user.type] || user.type}
              </span>
              <span className="font-mono text-[11px] text-slate-400">#{user.id}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <span className="truncate">{user.email || "—"}</span>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span>{user.phone || "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/users")}
            className="h-9 rounded-none border-slate-200 text-slate-700"
          >
            Retour
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/admin/users?edit=${user.id}`)}
            className="h-9 rounded-none bg-[#f08400] font-medium text-white hover:bg-[#d87200]"
          >
            <Edit2 className="mr-2 h-3.5 w-3.5" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="-mx-px overflow-x-auto border-t border-slate-200">
        <div className="flex min-w-max divide-x divide-slate-200 sm:min-w-0 sm:grid sm:grid-cols-4 sm:divide-x">
          {rail.map((item) => (
            <div key={item.label} className="flex min-w-[140px] items-center gap-3 px-5 py-3.5 sm:min-w-0">
              <span className={cn("h-1.5 w-1.5 shrink-0", item.dot)} />
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
                  {item.label}
                </p>
                <p className={cn("truncate text-sm font-medium", item.tone)}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
