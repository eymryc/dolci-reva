"use client";

import React from "react";
import {
  Calendar,
  Users,
  Building2,
  Home,
  Loader2,
} from "lucide-react";
import { useStats } from "@/hooks/use-stats";

export default function DashboardPage() {
  const { data: statsResponse, isLoading } = useStats();
  const stats = statsResponse || {
    residences: 0,
    hebergements: 0,
    visites: 0,
    reservations: 0,
  };

  const statCards = [
    {
      title: "Résidences",
      value: stats.residences,
      description: "Biens disponibles",
      icon: Home,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Hébergements",
      value: stats.hebergements,
      description: "Séjours actifs",
      icon: Building2,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Visites",
      value: stats.visites,
      description: "Demandes en cours",
      icon: Calendar,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Réservations",
      value: stats.reservations,
      description: "Confirmées ce mois",
      icon: Users,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-[#f08400] inline-block" /> : card.value}
            </p>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
