"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, MapPin, User, Mail, Phone, Building2, Image as ImageIcon, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useVisit } from "@/hooks/use-visits";
import Image from "next/image";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: {
      bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
      text: "text-yellow-700",
      border: "border-yellow-200/50",
      dot: "bg-yellow-500",
      label: "En attente",
    },
    CONFIRMED: {
      bg: "bg-gradient-to-r from-green-100 to-emerald-100",
      text: "text-green-700",
      border: "border-green-200/50",
      dot: "bg-green-500",
      label: "Confirmée",
    },
    CANCELLED: {
      bg: "bg-gradient-to-r from-red-100 to-rose-100",
      text: "text-red-700",
      border: "border-red-200/50",
      dot: "bg-red-500",
      label: "Annulée",
    },
    COMPLETED: {
      bg: "bg-gradient-to-r from-blue-100 to-indigo-100",
      text: "text-blue-700",
      border: "border-blue-200/50",
      dot: "bg-blue-500",
      label: "Terminée",
    },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <Badge
      className={`${config.bg} ${config.text} ${config.border} border inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-sm`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      {config.label}
    </Badge>
  );
};

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: visit, isLoading, error } = useVisit(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des détails de la visite...</p>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 font-medium">Une erreur s&apos;est produite lors du chargement de la visite.</p>
          <Button onClick={() => router.push("/admin/hebergements")} className="bg-[#f08400] hover:bg-[#d87200]">
            Retour aux visites
          </Button>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(visit.scheduled_at);
  const visitedDate = visit.visited_at ? new Date(visit.visited_at) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header avec fond dégradé */}
        <Card className="bg-gradient-to-br from-white via-white to-[#f08400]/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-200/60 overflow-hidden relative">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#f08400]/10 via-transparent to-transparent rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent rounded-full blur-3xl -z-0"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push("/admin/hebergements")}
                  className="h-10 w-10 rounded-xl hover:bg-[#f08400]/10 hover:border-[#f08400]/30 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Détails de la visite</h1>
                  <p className="text-gray-500 text-sm font-mono">{visit.visit_reference}</p>
                </div>
              </div>
              {getStatusBadge(visit.status)}
            </div>

            {/* Informations principales en ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 bg-[#f08400]/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#f08400]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date prévue</p>
                  <p className="font-semibold text-sm">
                    {scheduledDate.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-600">
                    {scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {visit.owner_confirmed && (
                <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Confirmation</p>
                    <p className="font-semibold text-sm text-green-700">Confirmée par le propriétaire</p>
                  </div>
                </div>
              )}
              {visit.visited_at && (
                <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date de visite</p>
                    <p className="font-semibold text-sm">
                      {visitedDate?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hébergement avec grande image */}
            <Card className="p-6 sm:p-8 shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#f08400]/10 rounded-xl">
                  <Building2 className="w-6 h-6 text-[#f08400]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Hébergement</h2>
              </div>
              
              {visit.dwelling.main_image_url && (
                <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6 shadow-lg">
                  <Image
                    src={visit.dwelling.main_image_url}
                    alt={visit.dwelling.address}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Adresse</p>
                    <p className="font-bold text-lg text-gray-900">{visit.dwelling.address}</p>
                    <p className="text-gray-600 mt-1">{visit.dwelling.city}, {visit.dwelling.country}</p>
                  </div>
                </div>
                
                {/* Galerie d'images */}
                {visit.dwelling.gallery_images && visit.dwelling.gallery_images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-700">
                        Galerie d&apos;images ({visit.dwelling.gallery_images.length})
                      </p>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {visit.dwelling.gallery_images.slice(0, 12).map((image) => (
                        <div 
                          key={image.id} 
                          className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 border-transparent hover:border-[#f08400] transition-all shadow-md hover:shadow-xl"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Image
                            src={image.thumb_url}
                            alt={image.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Visiteur */}
            {visit.visitor && (
              <Card className="p-6 shadow-lg border border-gray-200/50 rounded-2xl hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Visiteur</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Nom complet</p>
                    <p className="font-bold text-lg text-gray-900">{visit.visitor.first_name} {visit.visitor.last_name}</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-900 break-all">{visit.visitor.email}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{visit.visitor.phone}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Propriétaire */}
            <Card className="p-6 shadow-lg border border-gray-200/50 rounded-2xl hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#f08400]/10 rounded-xl">
                  <User className="w-6 h-6 text-[#f08400]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Propriétaire</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-[#f08400]/5 to-white rounded-xl border border-[#f08400]/20">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Nom complet</p>
                  <p className="font-bold text-lg text-gray-900">{visit.owner.first_name} {visit.owner.last_name}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-900 break-all">{visit.owner.email}</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{visit.owner.phone}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
