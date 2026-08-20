"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { usePayoutAccount } from "@/hooks/use-payout-account";
import { useCreateWithdrawal, useWithdrawals, type WithdrawalStatus } from "@/hooks/use-withdrawals";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useApproveWithdrawal,
  useApproveWithdrawalManual,
  useRejectWithdrawal,
} from "@/hooks/use-withdrawals";

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

export function WithdrawRequestPanel() {
  const { user, refreshUser } = useAuth();
  const { data: payout } = usePayoutAccount();
  const { data: withdrawals = [], isLoading } = useWithdrawals();
  const createWithdrawal = useCreateWithdrawal();
  const { isAnyAdmin } = usePermissions();
  const approve = useApproveWithdrawal();
  const approveManual = useApproveWithdrawalManual();
  const reject = useRejectWithdrawal();
  const [amount, setAmount] = useState("");

  const available = Number(user?.wallet?.balance) || 0;
  const showOwnerForm = !isAnyAdmin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 100) return;
    await createWithdrawal.mutateAsync(value);
    setAmount("");
    await refreshUser?.();
  };

  return (
    <div className="space-y-6">
      {showOwnerForm ? (
      <form onSubmit={onSubmit} className="border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">Demander un retrait</h3>
        <p className="mt-1 text-xs text-slate-500">
          Solde disponible :{" "}
          <span className="font-semibold text-slate-800">{formatMoney(available)}</span>
        </p>

        {!payout ? (
          <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Configurez d&apos;abord votre compte de versement dans Profil → Versement.
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-600">
            Versement vers{" "}
            <span className="font-semibold">
              {payout.channel.replace("_", " ")} · {payout.account_number}
            </span>
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="withdraw-amount" className="mb-1.5 block text-sm font-semibold">
              Montant (FCFA)
            </Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={100}
              max={available || undefined}
              step={100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-none"
              placeholder="Ex. 50000"
              disabled={!payout || available <= 0}
            />
          </div>
          <Button
            type="submit"
            disabled={
              !payout ||
              available <= 0 ||
              createWithdrawal.isPending ||
              !amount ||
              Number(amount) < 100
            }
            className="h-10 rounded-none bg-[#12100c] px-5 font-semibold text-white hover:bg-[#f08400]"
          >
            {createWithdrawal.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Demander"
            )}
          </Button>
        </div>
      </form>
      ) : null}

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Historique des retraits</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
            Chargement…
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Aucun retrait pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {withdrawals.map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{formatMoney(w.amount)}</p>
                  <p className="text-xs text-slate-500">
                    #{w.id} · {STATUS_LABEL[w.status] || w.status}
                    {w.created_at
                      ? ` · ${new Date(w.created_at).toLocaleString("fr-FR")}`
                      : ""}
                  </p>
                  {w.failure_reason ? (
                    <p className="mt-1 text-xs text-red-600">{w.failure_reason}</p>
                  ) : null}
                </div>
                {isAnyAdmin() && (w.status === "PENDING" || w.status === "FAILED") ? (
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
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
