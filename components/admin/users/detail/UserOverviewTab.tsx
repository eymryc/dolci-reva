/**
 * Composant pour l'onglet Vue d'ensemble de l'utilisateur
 */

import { User, Mail, Phone, Building2, TrendingUp, Calendar, Award, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User as UserType } from "@/types/entities/user.types";

interface UserOverviewTabProps {
  user: UserType;
}

export function UserOverviewTab({ user }: UserOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne principale */}
      <div className="lg:col-span-2 space-y-4">
        {/* Informations personnelles */}
        <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent p-5 border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
                <p className="text-xs text-gray-500 mt-0.5">Données de base de l&apos;utilisateur</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Prénom</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{user.first_name}</p>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nom</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{user.last_name}</p>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-1 break-all">{user.email}</p>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Téléphone
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{user.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Types de business */}
        {user.businessTypes && user.businessTypes.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/50 to-transparent p-5 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Types de business</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{user.businessTypes.length} type(s) de business</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {user.businessTypes.map((bt) => (
                  <Badge
                    key={bt.id}
                    className="bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 text-xs font-semibold hover:shadow-md transition-all duration-200"
                  >
                    {bt.name}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-4">
        <Card className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 via-orange-50/50 to-transparent p-5 border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Statistiques</h2>
                <p className="text-xs text-gray-500 mt-0.5">Métriques de performance</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 via-blue-50/50 to-white rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Score de réputation</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.reputation_score ? parseFloat(user.reputation_score).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 via-green-50/50 to-white rounded-lg border border-green-200/50 hover:border-green-300 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Total réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{user.total_bookings || 0}</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 bg-gradient-to-br ${parseFloat(user.cancellation_rate || "0") > 10 ? "from-red-50 via-red-50/50" : parseFloat(user.cancellation_rate || "0") > 5 ? "from-yellow-50 via-yellow-50/50" : "from-green-50 via-green-50/50"} to-white rounded-lg border ${parseFloat(user.cancellation_rate || "0") > 10 ? "border-red-200/50 hover:border-red-300" : parseFloat(user.cancellation_rate || "0") > 5 ? "border-yellow-200/50 hover:border-yellow-300" : "border-green-200/50 hover:border-green-300"} transition-all duration-200`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${parseFloat(user.cancellation_rate || "0") > 10 ? "from-red-500 to-red-600" : parseFloat(user.cancellation_rate || "0") > 5 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600"} rounded-lg shadow-md`}>
                    <Ban className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Taux d&apos;annulation</p>
                    <p className={`text-2xl font-bold ${parseFloat(user.cancellation_rate || "0") > 10 ? "text-red-600" : parseFloat(user.cancellation_rate || "0") > 5 ? "text-yellow-600" : "text-green-600"}`}>
                      {user.cancellation_rate ? parseFloat(user.cancellation_rate).toFixed(2) : "0.00"}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}






