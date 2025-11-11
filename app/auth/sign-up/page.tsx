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
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine, RiUserLine, RiPhoneLine, RiHomeLine, RiSearchLine, RiArrowLeftLine, RiCheckLine } from "react-icons/ri";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useBusinessTypes } from "@/hooks/use-business-types";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";

// Schéma de validation
const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  phone: z.string().min(8, { message: "Le numéro de téléphone est invalide" }),
  password: z.string().min(4, { message: "Le mot de passe doit contenir au moins 4 caractères" }),
  confirmPassword: z.string(),
  type: z.enum(["OWNER", "CUSTOMER"]),
  businessTypeIds: z.array(z.number()).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
  acceptNewsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.type === "OWNER") {
    return data.businessTypeIds && data.businessTypeIds.length > 0;
  }
  return true;
}, {
  message: "Veuillez sélectionner au moins un type de service",
  path: ["businessTypeIds"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

type UserType = "OWNER" | "CUSTOMER" | null;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<number[]>([]);
  const [showBusinessTypeSelection, setShowBusinessTypeSelection] = useState(false);
  const router = useRouter();
  
  // Charger les business types
  const { data: businessTypes = [], isLoading: isLoadingBusinessTypes } = useBusinessTypes();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
    reset,
    clearErrors,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      acceptTerms: false,
      acceptNewsletter: false,
      type: "CUSTOMER",
      businessTypeIds: [],
    },
  });

  const acceptTerms = watch("acceptTerms");

  // Mapping des noms de champs du serveur (snake_case) vers le formulaire (camelCase)
  const fieldMapping: Record<string, keyof SignUpFormValues> = {
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    phone: "phone",
    password: "password",
    password_confirmation: "confirmPassword",
    type: "type",
    services: "businessTypeIds",
  };

  // Labels personnalisés pour les champs
  const fieldLabels = createFieldLabels({
    first_name: "Prénom",
    last_name: "Nom",
    email: "Email",
    phone: "Téléphone",
    password: "Mot de passe",
    password_confirmation: "Confirmation du mot de passe",
    type: "Type de compte",
    services: "Types de services",
  });

  // Hook pour gérer les erreurs du serveur
  const { serverErrors, showErrorPanel, handleServerError, clearErrors: clearServerErrors, setShowErrorPanel } = useServerErrors<SignUpFormValues>({
    setError,
    fieldMapping,
  });

  const handleTypeSelection = (type: "OWNER" | "CUSTOMER") => {
    setSelectedType(type);
    setValue("type", type);
    
    // Si Owner, afficher la sélection des business types
    if (type === "OWNER") {
      setShowBusinessTypeSelection(true);
    } else {
      // Si Customer, aller directement au formulaire
      setShowBusinessTypeSelection(false);
    }
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
    setShowBusinessTypeSelection(false);
    setSelectedBusinessTypes([]);
    reset();
  };

  const handleBusinessTypeToggle = (businessTypeId: number) => {
    setSelectedBusinessTypes(prev => {
      const newSelection = prev.includes(businessTypeId)
        ? prev.filter(id => id !== businessTypeId)
        : [...prev, businessTypeId];
      setValue("businessTypeIds", newSelection);
      return newSelection;
    });
  };

  const handleBusinessTypeContinue = () => {
    if (selectedBusinessTypes.length === 0) {
      toast.error("Veuillez sélectionner au moins un type de service");
      return;
    }
    setShowBusinessTypeSelection(false);
  };

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      // Effacer les erreurs précédentes
      clearServerErrors();
      clearErrors();
      
      // S'assurer que les business types sont à jour
      setValue("businessTypeIds", selectedBusinessTypes);
      
      const response = await api.post("auth/register", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword,
        type: data.type,
        services: selectedBusinessTypes,
      });

      const successMessage = response?.data?.message;

      // Message de succès
      toast.success(successMessage || "Inscription réussie ! Vous pouvez maintenant vous connecter.");

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    } catch (error) {
      const { errorMessage, hasDetailedErrors } = handleServerError(error);

      // Afficher le toast seulement s'il n'y a pas d'erreurs détaillées
      if (!hasDetailedErrors) {
        toast.error(errorMessage);
      }
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
            {selectedType ? (
              selectedType === "OWNER" 
                ? "Publiez vos services et gérez vos biens immobiliers"
                : "Réservez et découvrez les meilleurs hébergements de Côte d&apos;Ivoire"
            ) : (
              "Choisissez votre profil pour commencer"
            )}
          </p>
        </div>

        {/* Étape 1 : Sélection du type de compte */}
        {!selectedType && (
          <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 via-transparent to-theme-accent/10 opacity-50"></div>
            
            {/* Animated Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-lg opacity-20 blur-xl animate-shimmer"></div>
            
            <div className="relative z-10">
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Choisissez votre profil
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Sélectionnez le type de compte qui correspond à vos besoins
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bouton Owner */}
                  <button
                    onClick={() => handleTypeSelection("OWNER")}
                    className="group relative p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-theme-primary transition-all duration-300 hover:shadow-2xl hover:shadow-theme-primary/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <RiHomeLine className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-theme-primary transition-colors">
                        Publier mes services
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Je suis propriétaire et je souhaite mettre mes biens en location
                      </p>
                      <div className="mt-4 flex items-center justify-center text-theme-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        Commencer
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Bouton Customer */}
                  <button
                    onClick={() => handleTypeSelection("CUSTOMER")}
                    className="group relative p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-theme-accent transition-all duration-300 hover:shadow-2xl hover:shadow-theme-accent/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-accent/0 via-theme-accent/5 to-theme-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-theme-accent to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <RiSearchLine className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-theme-accent transition-colors">
                        Réserver un hébergement
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Je souhaite réserver et découvrir les meilleurs hébergements
                      </p>
                      <div className="mt-4 flex items-center justify-center text-theme-accent font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        Commencer
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

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
        )}

        {/* Étape 2 : Sélection des business types (pour Owner uniquement) */}
        {selectedType === "OWNER" && showBusinessTypeSelection && (
          <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 via-transparent to-theme-accent/10 opacity-50"></div>
            
            {/* Animated Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-lg opacity-20 blur-xl animate-shimmer"></div>
            
            <div className="relative z-10">
              <CardHeader className="text-center pb-6 pt-8 relative">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToSelection}
                  className="absolute left-4 top-4 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RiArrowLeftLine className="w-5 h-5 mr-2" />
                  Retour
                </Button>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Sélectionnez vos types de services
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Choisissez les types de services que vous souhaitez proposer
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                {isLoadingBusinessTypes ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="w-8 h-8 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : businessTypes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Aucun type de service disponible pour le moment.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {businessTypes.map((businessType) => {
                        const isSelected = selectedBusinessTypes.includes(businessType.id);
                        return (
                          <button
                            key={businessType.id}
                            type="button"
                            onClick={() => handleBusinessTypeToggle(businessType.id)}
                            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg overflow-hidden ${
                              isSelected
                                ? "border-theme-primary bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 shadow-md"
                                : "border-gray-200 bg-white/50 hover:border-theme-primary/50"
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r from-theme-primary/0 via-theme-primary/5 to-theme-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              isSelected ? "opacity-100" : ""
                            }`}></div>
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? "bg-gradient-to-br from-theme-primary to-theme-accent"
                                    : "bg-gray-100 group-hover:bg-theme-primary/10"
                                }`}>
                                  {isSelected ? (
                                    <RiCheckLine className="w-6 h-6 text-white" />
                                  ) : (
                                    <RiHomeLine className={`w-6 h-6 transition-colors duration-300 ${
                                      isSelected ? "text-white" : "text-gray-400 group-hover:text-theme-primary"
                                    }`} />
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-theme-primary to-theme-accent flex items-center justify-center">
                                    <RiCheckLine className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                                isSelected ? "text-theme-primary" : "text-gray-900 group-hover:text-theme-primary"
                              }`}>
                                {businessType.name}
                              </h3>
                              {businessType.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {businessType.description}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {selectedBusinessTypes.length > 0 && (
                      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-theme-primary/10 to-theme-accent/10 border border-theme-primary/20">
                        <p className="text-sm font-semibold text-theme-primary mb-2">
                          {selectedBusinessTypes.length} type{selectedBusinessTypes.length > 1 ? "s" : ""} sélectionné{selectedBusinessTypes.length > 1 ? "s" : ""}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBusinessTypes.map((id) => {
                            const businessType = businessTypes.find(bt => bt.id === id);
                            return businessType ? (
                              <span
                                key={id}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-theme-primary to-theme-accent text-white"
                              >
                                {businessType.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {errors.businessTypeIds && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600 font-medium">{errors.businessTypeIds.message}</p>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleBusinessTypeContinue}
                      disabled={selectedBusinessTypes.length === 0}
                      className="w-full h-14 bg-gradient-to-r from-theme-primary via-orange-500 to-theme-accent text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-theme-primary/50 transition-all duration-300 rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Continuer
                        <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-accent via-orange-500 to-theme-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </>
                )}
              </CardContent>
            </div>
          </Card>
        )}

        {/* Étape 3 : Formulaire d'inscription avec Glassmorphism */}
        {selectedType && !showBusinessTypeSelection && (
          <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 via-transparent to-theme-accent/10 opacity-50"></div>
          
          {/* Animated Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-lg opacity-20 blur-xl animate-shimmer"></div>
          
          <div className="relative z-10">
              <CardHeader className="text-center pb-6 pt-8 relative">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (selectedType === "OWNER") {
                      setShowBusinessTypeSelection(true);
                    } else {
                      handleBackToSelection();
                    }
                  }}
                  className="absolute left-4 top-4 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RiArrowLeftLine className="w-5 h-5 mr-2" />
                  Retour
                </Button>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {selectedType === "OWNER" ? "Publier mes services" : "Réserver un hébergement"}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Remplissez le formulaire ci-dessous pour créer votre compte {selectedType === "OWNER" ? "propriétaire" : "client"}
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
                        className={`pl-12 h-14 border-2 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
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
                        className={`pl-12 h-14 border-2 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
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
                        className={`pl-12 h-14 border-2 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
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
                        className={`pl-12 h-14 border-2 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
                          errors.phone 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-theme-primary"
                        }`}
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
                        className={`pl-12 pr-12 h-14 border-2 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
                          errors.password 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-theme-primary"
                        }`}
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
                        className={`pl-12 pr-12 h-14 border-2 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-theme-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
                          errors.confirmPassword 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-theme-primary"
                        }`}
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

                {/* Champs cachés pour le type et les business types */}
                <input type="hidden" {...register("type")} value={selectedType || "CUSTOMER"} />

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
                        {selectedType === "OWNER" ? "Créer mon compte propriétaire" : "Créer mon compte client"}
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
        )}
      </div>
    </div>
  );
}
