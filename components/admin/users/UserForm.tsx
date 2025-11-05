"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserFormData } from "@/hooks/use-users";

// Schema de validation
const createUserSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis").min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis").min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirm_password: z.string().min(1, "La confirmation du mot de passe est requise"),
  type: z.string().min(1, "Le type est requis"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

const editUserSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis").min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().optional(),
  confirm_password: z.string().optional(),
  type: z.string().min(1, "Le type est requis"),
}).refine((data) => {
  // Si un mot de passe est fourni, les deux doivent correspondre
  if (data.password && data.password.trim() !== "") {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<UserFormData>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function UserForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  isEdit = false,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof createUserSchema> | z.infer<typeof editUserSchema>>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      password: "",
      confirm_password: "",
      type: defaultValues?.type || "OWNER",
    } as z.infer<typeof createUserSchema> | z.infer<typeof editUserSchema>,
  });

  const handleFormSubmit = (data: z.infer<typeof createUserSchema> | z.infer<typeof editUserSchema>) => {
    const formData: UserFormData = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      type: data.type,
    };
    
    // Ajouter le mot de passe seulement s'il est fourni
    if (data.password && data.password.trim() !== "") {
      formData.password = data.password;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="first_name"
            placeholder="Prénom"
            {...register("first_name")}
            className={errors.first_name ? "border-red-500 h-12" : "h-12"}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="last_name"
            placeholder="Nom"
            {...register("last_name")}
            className={errors.last_name ? "border-red-500 h-12" : "h-12"}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500 h-12" : "h-12"}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Téléphone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          placeholder="0123456789"
          {...register("phone")}
          className={errors.phone ? "border-red-500 h-12" : "h-12"}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">
          Type <span className="text-red-500">*</span>
        </Label>
        <select
          id="type"
          {...register("type")}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.type ? "border-red-500 h-12" : "h-12"
          }`}
        >
          <option value="OWNER">Propriétaire</option>
          <option value="ADMIN">Administrateur</option>
        </select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">
            Mot de passe {!isEdit && <span className="text-red-500">*</span>}
            {isEdit && <span className="text-gray-500 text-xs">(Laissez vide pour ne pas modifier)</span>}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={isEdit ? "Laissez vide pour ne pas modifier" : "Mot de passe"}
            {...register("password")}
            className={errors.password ? "border-red-500 h-12" : "h-12"}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">
            Confirmer le mot de passe {!isEdit && <span className="text-red-500">*</span>}
            {isEdit && <span className="text-gray-500 text-xs">(Laissez vide pour ne pas modifier)</span>}
          </Label>
          <Input
            id="confirm_password"
            type="password"
            placeholder={isEdit ? "Laissez vide pour ne pas modifier" : "Confirmer le mot de passe"}
            {...register("confirm_password")}
            className={errors.confirm_password ? "border-red-500 h-12" : "h-12"}
          />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-12"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
        >
          {isLoading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

