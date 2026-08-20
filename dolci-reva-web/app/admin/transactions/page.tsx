"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Ancien écran wallet_transactions — redirige vers la console Finance
 * (money_movements = source de vérité du suivi monétique).
 */
export default function TransactionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/operations");
  }, [router]);

  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin text-[#f08400]" />
      Redirection vers Finance…
    </div>
  );
}
