"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiMailLine, RiArrowLeftLine, RiCheckLine } from "react-icons/ri";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'envoi d'email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    console.log("Email de réinitialisation envoyé à:", email);
  };

  const handleResendEmail = () => {
    setIsSubmitted(false);
    setEmail("");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
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
          </div>

          {/* Message de confirmation */}
          <Card className="shadow-2xl border-0">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RiCheckLine className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Email envoyé !
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Nous avons envoyé un lien de réinitialisation à{" "}
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Vérifiez votre boîte de réception</strong> et cliquez sur le lien pour réinitialiser votre mot de passe.
                    Si vous ne voyez pas l&apos;email, vérifiez votre dossier spam.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full h-12 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white font-medium"
                  >
                    Renvoyer l&apos;email
                  </Button>
                  
                  <Link href="/auth/sign-in">
                    <Button
                      variant="ghost"
                      className="w-full h-12 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      <RiArrowLeftLine className="w-4 h-4 mr-2" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Mot de passe oublié ?</h1>
          <p className="text-gray-600 mt-2">Pas de problème, nous allons vous aider à le récupérer</p>
        </div>

        {/* Formulaire de réinitialisation */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</CardTitle>
            <CardDescription>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adresse email
                </Label>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
                    required
                  />
                </div>
              </div>

              {/* Bouton d'envoi */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-theme-primary to-orange-500 hover:from-orange-500 hover:to-theme-primary text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>

              {/* Informations supplémentaires */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Que se passe-t-il ensuite ?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Vous recevrez un email avec un lien sécurisé</li>
                  <li>• Cliquez sur le lien pour accéder à la page de réinitialisation</li>
                  <li>• Créez un nouveau mot de passe</li>
                  <li>• Connectez-vous avec vos nouveaux identifiants</li>
                </ul>
              </div>
            </form>

            {/* Lien vers la connexion */}
            <div className="text-center mt-6">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center text-theme-primary hover:text-orange-600 font-medium"
              >
                <RiArrowLeftLine className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
