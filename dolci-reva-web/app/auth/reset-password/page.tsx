"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RiArrowLeftLine, RiLockPasswordLine } from "react-icons/ri";
import api from "@/lib/axios";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailFromLink = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Lien invalide : token manquant.");
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success("Mot de passe réinitialisé. Vous pouvez vous connecter.");
      router.push("/auth/sign-in");
    } catch {
      toast.error("Impossible de réinitialiser le mot de passe. Lien expiré ?");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="shadow-2xl border-0">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <p className="text-gray-700">
            Ce lien de réinitialisation est invalide ou incomplet.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center text-[#f08400] font-medium"
          >
            Demander un nouveau lien
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription>
          Choisissez un mot de passe sécurisé pour votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
              readOnly={Boolean(emailFromLink)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                minLength={8}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirmer</Label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="pl-10 h-12"
                minLength={8}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#f08400] hover:bg-[#d97400] text-white font-semibold text-lg disabled:opacity-50"
          >
            {isLoading ? "Enregistrement…" : "Réinitialiser le mot de passe"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center text-[#f08400] hover:text-orange-600 font-medium"
          >
            <RiArrowLeftLine className="w-4 h-4 mr-2" />
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo/logo-custom.png"
              alt="Dolci Rêva Logo"
              width={150}
              height={75}
              className="mx-auto h-16 w-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Réinitialisation
          </h1>
        </div>
        <Suspense fallback={<Card className="shadow-2xl border-0 p-8 text-center">Chargement…</Card>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
