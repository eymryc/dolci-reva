"use client";

import { useEffect, useState } from "react";
import { Loader2, Landmark, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePayoutAccount,
  useUpsertPayoutAccount,
  usePaystackBanks,
  type PayoutChannel,
} from "@/hooks/use-payout-account";

const CHANNELS: { value: PayoutChannel; label: string; kind: "mobile" | "bank" }[] = [
  { value: "wave", label: "Wave", kind: "mobile" },
  { value: "orange_money", label: "Orange Money", kind: "mobile" },
  { value: "mtn", label: "MTN MoMo", kind: "mobile" },
  { value: "moov", label: "Moov Money", kind: "mobile" },
  { value: "bank", label: "Compte bancaire", kind: "bank" },
];

export function PayoutAccountForm() {
  const { data: account, isLoading } = usePayoutAccount();
  const upsert = useUpsertPayoutAccount();
  const [channel, setChannel] = useState<PayoutChannel>("wave");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");

  const isBank = channel === "bank";
  const { data: banks = [], isLoading: loadingBanks } = usePaystackBanks(
    "XOF",
    isBank ? undefined : "mobile_money",
    true
  );

  useEffect(() => {
    if (!account) return;
    setChannel(account.channel);
    setAccountName(account.account_name || "");
    setAccountNumber(account.account_number || "");
    setBankCode(account.bank_code || "");
    setBankName(account.bank_name || "");
  }, [account]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
        Chargement du compte de versement…
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert.mutate({
      channel,
      account_name: accountName.trim(),
      account_number: accountNumber.trim(),
      bank_code: bankCode || undefined,
      bank_name: bankName || undefined,
      currency: "XOF",
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm leading-relaxed text-slate-600">
        Indiquez où recevoir vos gains après check-in. Le paiement client passe
        toujours par Paystack ; ce compte sert uniquement aux{" "}
        <strong>retraits</strong> vers vous.
      </p>

      {account ? (
        <div
          className={`border px-3 py-2 text-xs ${
            account.is_verified
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {account.is_verified
            ? "Destinataire Paystack vérifié — retraits automatisables."
            : "Compte enregistré sans destinataire Paystack auto — un admin pourra valider le versement manuellement (souvent le cas Mobile Money XOF)."}
        </div>
      ) : null}

      <div>
        <Label className="mb-2 block text-sm font-semibold">Canal</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHANNELS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setChannel(c.value)}
              className={`flex items-center gap-2 border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                channel === c.value
                  ? "border-[#f08400] bg-[#fff4e8] text-[#f08400]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {c.kind === "bank" ? (
                <Landmark className="h-4 w-4 shrink-0" />
              ) : (
                <Smartphone className="h-4 w-4 shrink-0" />
              )}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="payout-name" className="mb-1.5 block text-sm font-semibold">
            Nom du titulaire
          </Label>
          <Input
            id="payout-name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="rounded-none"
            placeholder="Nom complet"
          />
        </div>
        <div>
          <Label htmlFor="payout-number" className="mb-1.5 block text-sm font-semibold">
            {isBank ? "N° de compte" : "N° de téléphone"}
          </Label>
          <Input
            id="payout-number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            className="rounded-none"
            placeholder={isBank ? "Compte bancaire" : "07 XX XX XX XX"}
          />
        </div>
      </div>

      {isBank ? (
        <div>
          <Label htmlFor="payout-bank" className="mb-1.5 block text-sm font-semibold">
            Banque
          </Label>
          {loadingBanks ? (
            <p className="text-xs text-slate-500">Chargement des banques…</p>
          ) : (
            <select
              id="payout-bank"
              value={bankCode}
              onChange={(e) => {
                const code = e.target.value;
                setBankCode(code);
                const bank = banks.find((b) => b.code === code);
                setBankName(bank?.name || "");
              }}
              required
              className="w-full rounded-none border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Choisir une banque</option>
              {banks.map((b) => (
                <option key={`${b.code}-${b.name}`} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          )}
          {banks.length === 0 && !loadingBanks ? (
            <p className="mt-1 text-xs text-amber-700">
              Aucune banque XOF renvoyée par Paystack. Saisissez le code banque
              manuellement si vous l&apos;avez.
            </p>
          ) : null}
          {banks.length === 0 ? (
            <Input
              className="mt-2 rounded-none"
              placeholder="Code banque Paystack"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
            />
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={upsert.isPending}
        className="h-11 rounded-none bg-[#f08400] font-semibold hover:bg-[#d97400]"
      >
        {upsert.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          "Enregistrer le compte de versement"
        )}
      </Button>
    </form>
  );
}
