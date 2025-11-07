"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { isCustomer } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implémenter la mise à jour du profil via l'API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      await refreshUser();
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil");
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Vous devez être connecté en tant que client pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8">
        <Link href="/customer/dashboard">
          <Button variant="ghost" className="mb-4 hover:bg-theme-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-theme-primary/10 rounded-xl">
            <User className="w-6 h-6 text-theme-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Mon profil
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/30 to-theme-accent/30 rounded-full blur-xl"></div>
              <Avatar className="relative w-24 h-24 ring-4 ring-theme-primary/20 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white text-2xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <Badge className="bg-theme-primary/10 text-theme-primary border-theme-primary/20">
              Client
            </Badge>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-theme-primary" />
                  Prénom
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-theme-primary" />
                  Nom
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-theme-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-theme-primary" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user?.first_name || "",
                        last_name: user?.last_name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                      });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-theme-primary hover:bg-theme-primary/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-theme-primary hover:bg-theme-primary/90 text-white"
                >
                  Modifier le profil
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

