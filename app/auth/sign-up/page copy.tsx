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
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine, RiUserLine, RiPhoneLine } from "react-icons/ri";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Schéma de validation
const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  phone: z.string().min(8, { message: "Le numéro de téléphone est invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
  acceptNewsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptTerms: false,
      acceptNewsletter: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const response = await api.post("auth/register", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      const successMessage = response?.data?.message;

      // Message de succès
      toast.success(successMessage || "Inscription réussie ! Vous pouvez maintenant vous connecter.");

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      console.log(error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4 py-8">
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

      <div className={`w-full max-w-2xl relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
            Rejoignez Dolci Rêva
          </h1>
          <p className="text-gray-600 mt-3 text-sm animate-slide-up-delayed">
            Créez votre compte et découvrez les trésors de Côte d&apos;Ivoire
          </p>
        </div>

        {/* Formulaire d'inscription avec Glassmorphism */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 via-transparent to-theme-accent/10 opacity-50"></div>
          
          {/* Animated Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-lg opacity-20 blur-xl animate-shimmer"></div>
          
          <div className="relative z-10">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Créer un compte
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Remplissez le formulaire ci-dessous pour créer votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 group">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-theme-primary">
                      Prénom
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <RiUserLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-theme-primary transition-colors duration-300 w-5 h-5 z-10" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Prénom"
                        {...register("firstName")}
                        className="pl-12 h-14 border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                        aria-invalid={!!errors.firstName}
                      />
                    </div>
                    {errors.firstName && (
                      <span className="text-xs text-red-500 font-medium">{errors.firstName.message}</span>
                    )}
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-theme-primary">
                      Nom
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <RiUserLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-theme-primary transition-colors duration-300 w-5 h-5 z-10" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Nom"
                        {...register("lastName")}
                        className="pl-12 h-14 border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                        aria-invalid={!!errors.lastName}
                      />
                    </div>
                    {errors.lastName && (
                      <span className="text-xs text-red-500 font-medium">{errors.lastName.message}</span>
                    )}
                  </div>
                </div>

                {/* Email et Téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2 group">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-theme-primary">
                      Numéro de téléphone
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <RiPhoneLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-theme-primary transition-colors duration-300 w-5 h-5 z-10" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+225 XX XX XX XX"
                        {...register("phone")}
                        className="pl-12 h-14 border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                    {errors.phone && (
                      <span className="text-xs text-red-500 font-medium">{errors.phone.message}</span>
                    )}
                  </div>
                </div>

                {/* Mot de passe et Confirmation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2 group">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-theme-primary">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <RiLockLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-theme-primary transition-colors duration-300 w-5 h-5 z-10" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmer votre mot de passe"
                        {...register("confirmPassword")}
                        className="pl-12 pr-12 h-14 border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-theme-primary transition-all duration-300 p-1 rounded-lg hover:bg-theme-primary/10 z-10"
                      >
                        {showConfirmPassword ? (
                          <RiEyeOffLine className="w-5 h-5 transition-transform duration-300" />
                        ) : (
                          <RiEyeLine className="w-5 h-5 transition-transform duration-300" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-start space-x-2 group">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setValue("acceptTerms", checked as boolean)}
                      className="mt-1 border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-theme-primary data-[state=checked]:to-theme-accent data-[state=checked]:border-theme-primary transition-all duration-300"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer group-hover:text-gray-900 transition-colors">
                      J&apos;accepte les{" "}
                      <Link href="/terms" className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent font-semibold hover:from-orange-600 hover:to-theme-accent transition-all duration-300">
                        conditions d&apos;utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link href="/privacy" className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent font-semibold hover:from-orange-600 hover:to-theme-accent transition-all duration-300">
                        politique de confidentialité
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <span className="text-xs text-red-500 font-medium">{errors.acceptTerms.message}</span>
                  )}
                  <div className="flex items-start space-x-2 group">
                    <Checkbox
                      id="acceptNewsletter"
                      checked={watch("acceptNewsletter")}
                      onCheckedChange={(checked) => setValue("acceptNewsletter", checked as boolean)}
                      className="mt-1 border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-theme-primary data-[state=checked]:to-theme-accent data-[state=checked]:border-theme-primary transition-all duration-300"
                    />
                    <Label htmlFor="acceptNewsletter" className="text-sm text-gray-600 leading-relaxed cursor-pointer group-hover:text-gray-900 transition-colors">
                      Je souhaite recevoir les actualités et offres spéciales par email
                    </Label>
                  </div>
                </div>

                {/* Bouton d'inscription */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-theme-primary via-orange-500 to-theme-accent text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-theme-primary/50 transition-all duration-300 rounded-xl relative overflow-hidden group mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                      Création du compte...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center justify-center">
                        Créer mon compte
                        <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-accent via-orange-500 to-theme-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </Button>
              </form>

              {/* Lien vers la connexion */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Déjà un compte ?{" "}
                  <Link
                    href="/auth/sign-in"
                    className="inline-flex items-center bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent font-bold hover:from-orange-600 hover:to-theme-accent transition-all duration-300 relative group"
                  >
                    Se connecter
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
