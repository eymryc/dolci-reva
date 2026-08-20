"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  Hourglass,
  Landmark,
  Loader2,
  Lock,
  PiggyBank,
  RefreshCcw,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useFinanceEscrow,
  useFinanceMovements,
  useFinanceSummary,
  type MoneyMovement,
  type MoneyMovementType,
} from "@/hooks/use-finance";
import { AdminWithdrawalsPanel } from "@/components/admin/payout/AdminWithdrawalsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<MoneyMovementType, string> = {
  CLIENT_CHARGE: "Paiement client",
  CLIENT_REFUND: "Remboursement",
  OWNER_RELEASE: "Libération proprio",
  PLATFORM_COMMISSION: "Commission",
  PLATFORM_RETENTION: "Rétention",
  OWNER_WITHDRAWAL: "Demande retrait",
  OWNER_TRANSFER_SUCCESS: "Versement OK",
  OWNER_TRANSFER_FAILED: "Versement échoué",
  WALLET_RECHARGE: "Recharge wallet",
  CREDIT_ISSUED: "Avoir émis",
  CREDIT_REDEEMED: "Avoir utilisé",
};

const TYPE_STYLE: Record<MoneyMovementType, string> = {
  CLIENT_CHARGE: "bg-emerald-50 text-emerald-800 border-emerald-200",
  CLIENT_REFUND: "bg-rose-50 text-rose-800 border-rose-200",
  OWNER_RELEASE: "bg-sky-50 text-sky-800 border-sky-200",
  PLATFORM_COMMISSION: "bg-amber-50 text-amber-900 border-amber-200",
  PLATFORM_RETENTION: "bg-orange-50 text-orange-900 border-orange-200",
  OWNER_WITHDRAWAL: "bg-violet-50 text-violet-800 border-violet-200",
  OWNER_TRANSFER_SUCCESS: "bg-emerald-50 text-emerald-800 border-emerald-200",
  OWNER_TRANSFER_FAILED: "bg-red-50 text-red-800 border-red-200",
  WALLET_RECHARGE: "bg-slate-100 text-slate-700 border-slate-200",
  CREDIT_ISSUED: "bg-[#fff4e8] text-[#c45f00] border-[#f08400]/30",
  CREDIT_REDEEMED: "bg-indigo-50 text-indigo-800 border-indigo-200",
};

const STATUS_STYLE: Record<string, string> = {
  RECORDED: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-100 text-amber-900",
  FAILED: "bg-red-100 text-red-800",
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

function personLabel(u?: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
} | null) {
  if (!u) return "—";
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return name || u.email || "—";
}

function amountTone(type: MoneyMovementType, direction: string) {
  if (type === "CLIENT_REFUND" || type === "OWNER_TRANSFER_FAILED" || direction === "OUT") {
    return "text-rose-700";
  }
  if (type === "CLIENT_CHARGE" || type === "OWNER_TRANSFER_SUCCESS") {
    return "text-emerald-700";
  }
  if (direction === "INTERNAL") {
    return "text-sky-800";
  }
  return "text-slate-900";
}

function amountPrefix(direction: string, type: MoneyMovementType) {
  if (type === "CLIENT_REFUND" || direction === "OUT") return "−";
  if (direction === "IN") return "+";
  return "";
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  accent: "orange" | "green" | "rose" | "amber" | "slate" | "sky";
}) {
  const accents = {
    orange: "from-[#fff4e8] to-white border-[#f08400]/25",
    green: "from-emerald-50/80 to-white border-emerald-200/70",
    rose: "from-rose-50/80 to-white border-rose-200/70",
    amber: "from-amber-50/80 to-white border-amber-200/70",
    slate: "from-slate-50 to-white border-slate-200",
    sky: "from-sky-50/80 to-white border-sky-200/70",
  };
  const iconWrap = {
    orange: "bg-[#f08400]/15 text-[#f08400]",
    green: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    slate: "bg-slate-200 text-slate-700",
    sky: "bg-sky-100 text-sky-700",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden border bg-gradient-to-br p-4 sm:p-5",
        accents[accent]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-[#12100c] sm:text-2xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center",
            iconWrap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: MoneyMovementType }) {
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-[11px] font-semibold",
        TYPE_STYLE[type] || "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {TYPE_LABEL[type] || type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        STATUS_STYLE[status] || "bg-slate-100 text-slate-600"
      )}
    >
      {status === "RECORDED"
        ? "Enregistré"
        : status === "PENDING"
          ? "En cours"
          : status === "FAILED"
            ? "Échec"
            : status}
    </span>
  );
}

function MovementsTable({
  movements,
  isLoading,
}: {
  movements: MoneyMovement[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
        Chargement du flux…
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="px-4 py-14 text-center">
        <CircleDollarSign className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          Aucun mouvement
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Les paiements et remboursements apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-[#e8e4dc] bg-[#faf8f5] text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Montant</th>
            <th className="px-4 py-3">Acteur</th>
            <th className="px-4 py-3">Réservation</th>
            <th className="px-4 py-3">Réf. Paystack</th>
            <th className="px-4 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m, idx) => (
            <tr
              key={m.id}
              className={cn(
                "border-b border-slate-100 transition-colors hover:bg-[#fff8f0]/70",
                idx % 2 === 1 && "bg-[#fafaf8]/60"
              )}
            >
              <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                {m.occurred_at
                  ? new Date(m.occurred_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  {m.direction === "OUT" || m.type === "CLIENT_REFUND" ? (
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  ) : m.direction === "IN" ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <RefreshCcw className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                  )}
                  <TypeBadge type={m.type} />
                </div>
              </td>
              <td
                className={cn(
                  "whitespace-nowrap px-4 py-3.5 text-right text-[15px] font-semibold tabular-nums",
                  amountTone(m.type, m.direction)
                )}
              >
                {amountPrefix(m.direction, m.type)}
                {formatMoney(m.amount)}
              </td>
              <td className="px-4 py-3.5">
                <p className="text-sm font-medium text-slate-800">
                  {personLabel(m.user)}
                </p>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-xs text-slate-600">
                  {m.booking?.booking_reference ||
                    (m.booking_id ? `#${m.booking_id}` : "—")}
                </span>
              </td>
              <td className="max-w-[160px] truncate px-4 py-3.5 font-mono text-[11px] text-slate-500" title={m.external_reference || undefined}>
                {m.external_reference || "—"}
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={m.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pager({
  page,
  lastPage,
  onPrev,
  onNext,
}: {
  page: number;
  lastPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-[#faf8f5]/60 px-4 py-3">
      <p className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-800">{page}</span> /{" "}
        {lastPage || 1}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-none border-slate-200 px-3 text-xs"
          disabled={page <= 1}
          onClick={onPrev}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-none border-slate-200 px-3 text-xs"
          disabled={page >= lastPage}
          onClick={onNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

export function AdminFinanceConsole() {
  const [tab, setTab] = useState("overview");
  const [fluxPage, setFluxPage] = useState(1);
  const [escrowPage, setEscrowPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: summary, isLoading: loadingSummary } = useFinanceSummary();
  const { data: movementsResp, isLoading: loadingMovements } =
    useFinanceMovements({
      page: fluxPage,
      type: typeFilter || undefined,
      enabled: tab === "flux" || tab === "overview",
    });
  const { data: escrowResp, isLoading: loadingEscrow } = useFinanceEscrow(
    escrowPage,
    tab === "escrow"
  );

  const movements = movementsResp?.data || [];
  const escrow = escrowResp?.data || [];

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white px-5 py-6 sm:px-7">
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f08400] via-[#ffb347] to-transparent"
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
              Ledger plateforme
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#12100c] sm:text-[1.75rem]">
              Suivi monétique
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Une seule timeline : paiements clients, remboursements, séquestre,
              commissions et versements propriétaires.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
              + Entrée
            </span>
            <span className="border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-800">
              − Sortie
            </span>
            <span className="border border-sky-200 bg-sky-50 px-2.5 py-1 font-semibold text-sky-800">
              ↔ Interne
            </span>
          </div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="overflow-hidden border border-[#e8e4dc] bg-white shadow-[0_12px_40px_-28px_rgba(18,16,12,0.35)]">
          <div className="border-b border-[#e8e4dc] bg-[#faf8f5] px-3 pt-3 sm:px-5">
            <TabsList className="inline-flex h-auto w-full flex-wrap justify-start gap-0 bg-transparent p-0 sm:w-auto">
              {(
                [
                  ["overview", "Vue d'ensemble"],
                  ["flux", "Flux"],
                  ["escrow", "Escrow"],
                  ["retraits", "Retraits"],
                ] as const
              ).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors data-[state=active]:border-[#f08400] data-[state=active]:bg-transparent data-[state=active]:text-[#12100c] sm:px-4"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0 space-y-5 p-4 sm:p-6">
            {loadingSummary ? (
              <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
                Chargement des indicateurs…
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard
                  label="GMV encaissé"
                  value={formatMoney(summary?.gmv ?? 0)}
                  hint="Somme des paiements clients"
                  icon={CircleDollarSign}
                  accent="green"
                />
                <KpiCard
                  label="Remboursé"
                  value={formatMoney(summary?.refunded ?? 0)}
                  hint="Retours Paystack vers les clients"
                  icon={ArrowUpRight}
                  accent="rose"
                />
                <KpiCard
                  label="Net collecté"
                  value={formatMoney(summary?.net_collected ?? 0)}
                  hint="GMV − remboursements"
                  icon={Scale}
                  accent="orange"
                />
                <KpiCard
                  label="Escrow ouvert"
                  value={formatMoney(summary?.escrow_open_amount ?? 0)}
                  hint={`${summary?.escrow_open_count ?? 0} résa payée(s), pas encore check-in`}
                  icon={Lock}
                  accent="amber"
                />
                <KpiCard
                  label="Commissions"
                  value={formatMoney(summary?.commissions ?? 0)}
                  hint="Créditées au check-in"
                  icon={Landmark}
                  accent="sky"
                />
                <KpiCard
                  label="Solde plateforme"
                  value={formatMoney(summary?.platform_balance ?? 0)}
                  hint={`${summary?.pending_withdrawals ?? 0} retrait(s) à traiter`}
                  icon={PiggyBank}
                  accent="slate"
                />
              </div>
            )}

            <section className="border border-[#e8e4dc]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8e4dc] bg-[#faf8f5] px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#12100c]">
                    Derniers mouvements
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aperçu du journal (10 plus récents)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-none border-slate-200 text-xs"
                  onClick={() => setTab("flux")}
                >
                  Voir tout le flux
                </Button>
              </div>
              <MovementsTable
                movements={movements.slice(0, 10)}
                isLoading={loadingMovements}
              />
            </section>
          </TabsContent>

          <TabsContent value="flux" className="mt-0 space-y-0 p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e4dc] bg-[#faf8f5] px-4 py-3 sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-[#12100c]">
                  Journal des mouvements
                </h3>
                <p className="text-xs text-slate-500">
                  Filtrez par type d&apos;événement monétique
                </p>
              </div>
              <select
                className="h-9 min-w-[200px] border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#f08400]"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setFluxPage(1);
                }}
              >
                <option value="">Tous les types</option>
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <MovementsTable
              movements={movements}
              isLoading={loadingMovements}
            />
            <Pager
              page={movementsResp?.meta?.current_page || 1}
              lastPage={movementsResp?.meta?.last_page || 1}
              onPrev={() => setFluxPage((p) => Math.max(1, p - 1))}
              onNext={() => setFluxPage((p) => p + 1)}
            />
          </TabsContent>

          <TabsContent value="escrow" className="mt-0 space-y-0 p-0">
            <div className="border-b border-[#e8e4dc] bg-[#faf8f5] px-4 py-3 sm:px-5">
              <h3 className="text-sm font-semibold text-[#12100c]">
                Fonds en séquestre
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Payés par le client, pas encore libérés au check-in
              </p>
            </div>

            {loadingEscrow ? (
              <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
                Chargement…
              </div>
            ) : escrow.length === 0 ? (
              <div className="px-4 py-14 text-center">
                <Hourglass className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Aucun escrow ouvert
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {escrow.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#fff8f0]/50 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                          Sécurisé
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {b.booking_reference || `#${b.id}`}
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-[#12100c]">
                        {formatMoney(b.total_price)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Client {personLabel(b.customer)} · Hôte{" "}
                        {personLabel(b.owner)}
                      </p>
                      {b.payment_reference ? (
                        <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
                          {b.payment_reference}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3 border border-slate-100 bg-[#faf8f5] px-3 py-2.5 sm:min-w-[220px]">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Proprio
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-800">
                          {formatMoney(b.owner_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Commission
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-800">
                          {formatMoney(b.commission_amount)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Pager
              page={escrowResp?.meta?.current_page || 1}
              lastPage={escrowResp?.meta?.last_page || 1}
              onPrev={() => setEscrowPage((p) => Math.max(1, p - 1))}
              onNext={() => setEscrowPage((p) => p + 1)}
            />
          </TabsContent>

          <TabsContent value="retraits" className="mt-0 p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[#f08400]" />
              <h3 className="text-sm font-semibold text-[#12100c]">
                File des retraits propriétaires
              </h3>
            </div>
            <AdminWithdrawalsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
