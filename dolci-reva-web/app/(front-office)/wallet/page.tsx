import { redirect } from "next/navigation";

/** Wallet temporairement retiré de l'espace customer */
export default function WalletRedirectPage() {
  redirect("/customer/dashboard");
}
