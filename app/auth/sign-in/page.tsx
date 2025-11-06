"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine } from "react-icons/ri";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: typeof window !== "undefined" ? localStorage.getItem("remembered_email") || "" : "",
      rememberMe: typeof window !== "undefined" ? !!localStorage.getItem("remembered_email") : false,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const rememberMe = watch("rememberMe");

  // Mapping des noms de champs du serveur vers le formulaire
  const fieldMapping: Record<string, keyof LoginFormValues> = {
    email: "email",
    password: "password",
  };

  // Labels personnalisés pour les champs
  const fieldLabels = createFieldLabels({
    email: "Email",
    password: "Mot de passe",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<LoginFormValues>({
    setError,
    fieldMapping,
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Effacer les erreurs précédentes
      clearServerErrors();
      clearErrors();

      const response = await api.post("auth/login", {
        email: data.email,
        password: data.password,
      });

      const successMessage = response?.data?.message;
      const userData = response.data;

      // Sauvegarder le token
      localStorage.setItem("access_token", userData.token);

      // Si "Se souvenir de moi" est coché, sauvegarder l'email
      if (data.rememberMe) {
        localStorage.setItem("remembered_email", data.email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      // Rafraîchir les données utilisateur
      await refreshUser();

      // Message de succès
      toast.success(successMessage || "Connexion réussie");

      // Rediriger vers la page d'accueil
      router.push("/");
    } catch (error) {
      const { errorMessage, hasDetailedErrors } = handleServerError(error);

      // Afficher le toast seulement s'il n'y a pas d'erreurs détaillées
      if (!hasDetailedErrors) {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-theme-primary/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-yellow-300/20 to-theme-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-theme-primary/10 to-theme-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-theme-primary/10 to-transparent rounded-2xl rotate-45 animate-float"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-tr from-theme-accent/10 to-transparent rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-gradient-to-br from-yellow-300/10 to-transparent rounded-lg rotate-12 animate-float-slow"></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-accent rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <Image 
                src="/logo/logo-custom.png" 
                alt="Dolci Rêva Logo" 
                width={150} 
                height={75} 
                className="mx-auto h-16 w-auto relative z-10" 
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mt-6 animate-slide-up">
            Bienvenue sur Dolci Rêva
          </h1>
          <p className="text-gray-600 mt-3 text-sm animate-slide-up-delayed">
            Connectez-vous pour découvrir les meilleurs lieux de Côte d&apos;Ivoire
          </p>
        </div>

        {/* Formulaire de connexion avec Glassmorphism */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 via-transparent to-theme-accent/10 opacity-50"></div>
          
          {/* Animated Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-lg opacity-20 blur-xl animate-shimmer"></div>
          
          <div className="relative z-10">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Connexion
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Entrez vos identifiants pour accéder à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              {/* Panneau d'erreurs du serveur */}
              <ServerErrorPanel
                errors={serverErrors}
                fieldLabels={fieldLabels}
                show={showErrorPanel}
                onClose={() => {
                  setShowErrorPanel(false);
                  clearServerErrors();
                  clearErrors();
                }}
              />
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-theme-primary">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <RiMailLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-theme-primary transition-colors duration-300 w-5 h-5 z-10" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      {...register("email")}
                      className="pl-12 h-14 border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
                  )}
                </div>

                {/* Mot de passe */}
                <div className="space-y-2 group">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-theme-primary">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <RiLockLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-theme-primary transition-colors duration-300 w-5 h-5 z-10" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      {...register("password")}
                      className="pl-12 pr-12 h-14 border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-theme-primary transition-all duration-300 p-1 rounded-lg hover:bg-theme-primary/10 z-10"
                    >
                      {showPassword ? (
                        <RiEyeOffLine className="w-5 h-5 transition-transform duration-300" />
                      ) : (
                        <RiEyeLine className="w-5 h-5 transition-transform duration-300" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
                  )}
                </div>

                {/* Se souvenir de moi et mot de passe oublié */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2 group">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                      className="border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-theme-primary data-[state=checked]:to-theme-accent data-[state=checked]:border-theme-primary transition-all duration-300"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer group-hover:text-gray-900 transition-colors">
                      Se souvenir de moi
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent font-semibold hover:from-orange-600 hover:to-theme-accent transition-all duration-300 relative group"
                  >
                    Mot de passe oublié ?
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-theme-primary to-theme-accent group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-theme-primary via-orange-500 to-theme-accent text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-theme-primary/50 transition-all duration-300 rounded-xl relative overflow-hidden group mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                      Connexion en cours...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center justify-center">
                        Se connecter
                        <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-accent via-orange-500 to-theme-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </Button>
              </form>

              {/* Lien vers l'inscription */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Pas encore de compte ?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent font-bold hover:from-orange-600 hover:to-theme-accent transition-all duration-300 relative group"
                  >
                    Créer un compte
                    <svg className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

    </div>
  );
}