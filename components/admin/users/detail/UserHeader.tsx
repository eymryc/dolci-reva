/**
 * Composant pour l'en-tête de la page de détail utilisateur
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Edit2, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserTypeBadge } from "./UserTypeBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import type { User } from "@/types/entities/user.types";

interface UserHeaderProps {
  user: User;
}

export function UserHeader({ user }: UserHeaderProps) {
  const router = useRouter();

  const getUserInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-200/60 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#f08400]/5 via-transparent to-transparent rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#f08400] via-[#f08400]/90 to-orange-600 flex items-center justify-center shadow-2xl shadow-[#f08400]/30 ring-4 ring-white">
                <span className="text-3xl font-bold text-white">{getUserInitials()}</span>
              </div>
              {user.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
              {user.is_premium && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-[#101828]">
                  {user.first_name} {user.last_name}
                </h1>
                <UserTypeBadge type={user.type} />
              </div>
              <p className="text-gray-600 text-base mb-3 flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </span>
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <UserStatusBadge status={user.verification_status} />
                {user.role && (
                  <Badge variant="outline" className="px-3 py-1">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/admin/users?edit=${user.id}`)}
              className="bg-[#f08400] hover:bg-[#d87200] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}






