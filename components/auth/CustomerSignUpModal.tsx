"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine, RiUserLine } from "react-icons/ri";
import PhoneInput from "@/components/ui/PhoneInput";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schéma de validation pour Customer uniquement
const customerSignUpSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  phone: z.string().min(8, { message: "Le numéro de téléphone est invalide" }),
  password: z.string().min(4, { message: "Le mot de passe doit contenir au moins 4 caractères" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
  acceptNewsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type CustomerSignUpFormValues = z.infer<typeof customerSignUpSchema>;

interface CustomerSignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerSignUpModal({ open, onOpenChange }: CustomerSignUpModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
    reset,
    clearErrors,
  } = useForm<CustomerSignUpFormValues>({
    resolver: zodResolver(customerSignUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      acceptTerms: false,
      acceptNewsletter: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  // Mapping des noms de champs du serveur (snake_case) vers le formulaire (camelCase)
  const fieldMapping: Record<string, keyof CustomerSignUpFormValues> = {
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    phone: "phone",
    password: "password",
    password_confirmation: "confirmPassword",
  };

  // Labels personnalisés pour les champs
  const fieldLabels = createFieldLabels({
    first_name: "Prénom",
    last_name: "Nom",
    email: "Email",
    phone: "Téléphone",
    password: "Mot de passe",
    password_confirmation: "Confirmation du mot de passe",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<CustomerSignUpFormValues>({
    setError,
    fieldMapping,
  });

  const onSubmit = async (data: CustomerSignUpFormValues) => {
    try {
      // Effacer les erreurs précédentes
      clearServerErrors();
      clearErrors();
      
      const response = await api.post("auth/register", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword,
        type: "CUSTOMER",
      });

      const successMessage = response?.data?.message;

      // Message de succès
      toast.success(successMessage || "Inscription réussie ! Connexion en cours...");

      // Se connecter automatiquement après l'inscription
      try {
        const loginResponse = await api.post("auth/login", {
          email: data.email,
          password: data.password,
        });

        if (loginResponse.data.access_token) {
          localStorage.setItem("access_token", loginResponse.data.access_token);
          await refreshUser();
          toast.success("Connexion réussie !");
          onOpenChange(false);
          reset();
        }
      } catch {
        // Si la connexion automatique échoue, rediriger vers la page de connexion
        toast.info("Inscription réussie ! Veuillez vous connecter.");
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
      }
    } catch (error) {
      const { errorMessage, hasDetailedErrors } = handleServerError(error);

      // Afficher le toast seulement s'il n'y a pas d'erreurs détaillées
      if (!hasDetailedErrors) {
        toast.error(errorMessage);
      }
    }
  };

  const handleClose = () => {
    reset();
    clearErrors();
    clearServerErrors();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Créer un compte client
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Créez votre compte pour réserver ou contacter les propriétaires
          </DialogDescription>
        </DialogHeader>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                Prénom
              </Label>
              <div className="relative">
                <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Prénom"
                  {...register("firstName")}
                  className={`pl-10 h-12 border-2 ${
                    errors.firstName 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-theme-primary"
                  }`}
                  aria-invalid={!!errors.firstName}
                />
              </div>
              {errors.firstName && (
                <span className="text-xs text-red-500 font-medium">{errors.firstName.message}</span>
              )}
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                Nom
              </Label>
              <div className="relative">
                <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Nom"
                  {...register("lastName")}
                  className={`pl-10 h-12 border-2 ${
                    errors.lastName 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-theme-primary"
                  }`}
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
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Adresse email
              </Label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...register("email")}
                  className={`pl-10 h-12 border-2 ${
                    errors.email 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-theme-primary"
                  }`}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
              )}
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Numéro de téléphone
              </Label>
              <div className="relative">
                <PhoneInput
                  onChange={(value) => {
                    if (value) {
                      setValue("phone", value, { shouldValidate: false });
                      // Valider seulement après un délai pour éviter les erreurs pendant la saisie
                      setTimeout(() => {
                        setValue("phone", value, { shouldValidate: true });
                      }, 500);
                    }
                  }}
                  register={register("phone")}
                  placeholder="Entrez votre numéro"
                  defaultCountry="ci"
                  error={!!errors.phone}
                  className={`h-12 border-2 ${
                    errors.phone 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200"
                  }`}
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
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Mot de passe
              </Label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  {...register("password")}
                  className={`pl-10 pr-10 h-12 border-2 ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-theme-primary"
                  }`}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-theme-primary transition-colors"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
              )}
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmer votre mot de passe"
                  {...register("confirmPassword")}
                  className={`pl-10 pr-10 h-12 border-2 ${
                    errors.confirmPassword 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-theme-primary"
                  }`}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-theme-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setValue("acceptTerms", checked as boolean)}
                className="mt-1 border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-theme-primary data-[state=checked]:to-theme-accent data-[state=checked]:border-theme-primary"
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                J&apos;accepte les{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-theme-primary font-semibold hover:underline">
                  conditions d&apos;utilisation
                </a>{" "}
                et la{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-theme-primary font-semibold hover:underline">
                  politique de confidentialité
                </a>
              </Label>
            </div>
            {errors.acceptTerms && (
              <span className="text-xs text-red-500 font-medium">{errors.acceptTerms.message}</span>
            )}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptNewsletter"
                checked={watch("acceptNewsletter")}
                onCheckedChange={(checked) => setValue("acceptNewsletter", checked as boolean)}
                className="mt-1 border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-theme-primary data-[state=checked]:to-theme-accent data-[state=checked]:border-theme-primary"
              />
              <Label htmlFor="acceptNewsletter" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                Je souhaite recevoir les actualités et offres spéciales par email
              </Label>
            </div>
          </div>

          {/* Bouton d'inscription */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-theme-primary to-theme-accent text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block"></span>
                Création du compte...
              </>
            ) : (
              "Créer mon compte client"
            )}
          </Button>
        </form>

        <div className="text-center mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => {
                handleClose();
                router.push("/auth/sign-in");
              }}
              className="text-theme-primary font-semibold hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

