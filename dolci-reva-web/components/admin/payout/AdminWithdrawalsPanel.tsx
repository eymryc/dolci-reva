"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useApproveWithdrawal,
  useApproveWithdrawalManual,
  useRejectWithdrawal,
  useWithdrawals,
  type Withdrawal,
  type WithdrawalStatus,
} from "@/hooks/use-withdrawals";
import { usePlatformWallet } from "@/hooks/use-platform-wallet";

const STATUS_LABEL: Record<WithdrawalStatus, string> = {
  PENDING: "En attente",
  PROCESSING: "Transfert en cours",
  APPROVED: "Versé",
  REJECTED: "Rejeté",
  FAILED: "Échec transfert",
};

function formatMoney(value: number | string) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

function ownerLabel(w: Withdrawal) {
  const u = w.user;
  if (!u) return `Proprio #${w.user_id}`;
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return name || u.email || `Proprio #${w.user_id}`;
}

function payoutHint(w: Withdrawal) {
  const snap = w.payout_snapshot;
  if (!snap || typeof snap !== "object") return null;
  const channel = String((snap as { channel?: string }).channel || "");
  const account = String(
    (snap as { account_number?: string }).account_number || ""
  );
  if (!channel && !account) return null;
  return `${channel.replace("_", " ")}${account ? ` · ${account}` : ""}`;
}

export function AdminWithdrawalsPanel() {
  const { data: platform, isLoading: loadingPlatform } = usePlatformWallet();
  const { data: withdrawals = [], isLoading } = useWithdrawals();
  const approve = useApproveWithdrawal();
  const approveManual = useApproveWithdrawalManual();
  const reject = useRejectWithdrawal();

  const actionable = withdrawals.filter(
    (w) => w.status === "PENDING" || w.status === "FAILED"
  );
  const others = withdrawals.filter(
    (w) => w.status !== "PENDING" && w.status !== "FAILED"
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Commissions plateforme
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loadingPlatform
              ? "…"
              : formatMoney(platform?.balance ?? 0)}
          </p>
        </div>
        <div className="border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
            À traiter
          </p>
          <p className="mt-1 text-lg font-bold text-amber-900">
            {platform?.pending_withdrawals ?? actionable.length}
          </p>
        </div>
        <div className="border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Transferts en cours
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {platform?.processing_withdrawals ?? 0}
          </p>
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Retraits à approuver
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Paystack Transfer si recipient OK, sinon validation manuelle (Wave /
            OM hors API).
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
            Chargement…
          </div>
        ) : actionable.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Aucun retrait en attente.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {actionable.map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {formatMoney(w.amount)}
                    <span className="ml-2 text-xs font-medium text-slate-500">
                      {STATUS_LABEL[w.status] || w.status}
                    </span>
                  </p>
                  <p className="truncate text-xs text-slate-600">
                    {ownerLabel(w)}
                    {w.user?.email ? ` · ${w.user.email}` : ""}
                  </p>
                  {payoutHint(w) ? (
                    <p className="mt-0.5 text-xs text-slate-500">{payoutHint(w)}</p>
                  ) : null}
                  {w.failure_reason ? (
                    <p className="mt-1 text-xs text-red-600">{w.failure_reason}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-none bg-[#f08400] text-xs hover:bg-[#d97400]"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate(w.id)}
                  >
                    Approuver (Paystack)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-none text-xs"
                    disabled={approveManual.isPending}
                    onClick={() => approveManual.mutate(w.id)}
                  >
                    Manuel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-none text-xs text-red-600"
                    disabled={reject.isPending}
                    onClick={() => reject.mutate(w.id)}
                  >
                    Rejeter
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {others.length > 0 ? (
        <div className="border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Historique récent
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {others.slice(0, 20).map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatMoney(w.amount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ownerLabel(w)} · {STATUS_LABEL[w.status] || w.status}
                    {w.created_at
                      ? ` · ${new Date(w.created_at).toLocaleString("fr-FR")}`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
