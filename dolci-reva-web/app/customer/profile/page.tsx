"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Save, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type User } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { CustomerPageHeader } from "@/components/customer/CustomerPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { ApiResponse, extractApiMessage } from "@/types/api-response.types";
import { handleError } from "@/lib/error-handler";

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { isCustomer } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.put<ApiResponse<User>>("/profile", formData);
      await refreshUser();
      setIsEditing(false);
      const message = extractApiMessage(response.data);
      toast.success(message || "Profil mis à jour avec succès !");
    } catch (error: unknown) {
      handleError(error, {
        defaultMessage: "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  if (!isCustomer()) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-[#12100c]">Accès refusé</h1>
        <p className="text-[#12100c]/60">
          Vous devez être connecté en tant que client pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <CustomerPageHeader
        eyebrow="Compte"
        title="Mon profil"
        description="Gérez vos informations personnelles."
        actions={
          !isEditing ? (
            <Button
              type="button"
              className="rounded-none bg-[#f08400] hover:bg-[#d97400]"
              onClick={() => {
                setFormData({
                  first_name: user?.first_name || "",
                  last_name: user?.last_name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                });
                setIsEditing(true);
              }}
            >
              Modifier
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="rounded-none border-[#12100c]/15"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-[#12100c]/10 bg-white p-6 text-center lg:col-span-1">
          <Avatar className="mx-auto h-24 w-24 overflow-hidden rounded-none">
            <AvatarFallback className="rounded-none bg-[#f08400] text-2xl font-bold text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-xl font-bold text-[#12100c]">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[#12100c]/55">
            <Mail className="h-3.5 w-3.5" />
            {user?.email}
          </p>
          {user?.phone ? (
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-[#12100c]/55">
              <Phone className="h-3.5 w-3.5" />
              {user.phone}
            </p>
          ) : null}
          <span className="mt-4 inline-block bg-[#fff4e8] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#f08400]">
            Client
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-[#12100c]/10 bg-white p-6 sm:p-8 lg:col-span-2"
        >
          <div className="mb-6 border-b border-[#12100c]/08 pb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#12100c]">
              <UserIcon className="h-5 w-5 text-[#f08400]" />
              Informations personnelles
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {(
              [
                { id: "first_name" as const, label: "Prénom", type: "text" as const },
                { id: "last_name" as const, label: "Nom", type: "text" as const },
                { id: "email" as const, label: "Email", type: "email" as const },
                { id: "phone" as const, label: "Téléphone", type: "tel" as const },
              ]
            ).map(({ id, label, type }) => (
              <div key={id} className="space-y-2">
                <Label htmlFor={id} className="text-sm font-semibold text-[#12100c]">
                  {label}
                </Label>
                <Input
                  id={id}
                  name={id}
                  type={type}
                  value={formData[id]}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`h-11 rounded-none ${
                    !isEditing
                      ? "cursor-not-allowed border-[#12100c]/08 bg-[#faf8f5]"
                      : "border-[#12100c]/15 bg-white focus-visible:ring-[#f08400]"
                  }`}
                />
              </div>
            ))}
          </div>

          {isEditing ? (
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-none bg-[#f08400] hover:bg-[#d97400]"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Enregistrer
              </Button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
