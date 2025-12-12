"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Loader2,
  Home,
  Building2
} from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { useVisits } from "@/hooks/use-visits";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { VisitTable } from "@/components/admin/hebergements/VisitTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CustomerDashboardPage() {
  const { isCustomer } = usePermissions();
  const [activeTab, setActiveTab] = useState("residences");
  const { 
    data: bookingsResponse, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);

  const [visitsPage] = useState(1);
  const { 
    data: visitsData,
    isLoading: isLoadingVisits,
    refetch: refetchVisits,
    isRefetching: isRefetchingVisits,
  } = useVisits(visitsPage);
  const visits = visitsData?.data || [];

  const bookings = bookingsResponse?.data || [];

  if (!isCustomer()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Vous devez être connecté en tant que client pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-6">
      {/* Hero Section */}
      <section className="relative mb-16 overflow-hidden bg-gradient-to-br from-theme-primary via-theme-primary/90 to-theme-accent rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                Mon Espace Client
              </h1>
              <div className="flex flex-wrap gap-3">
                <Link href="/residences">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-theme-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Explorer les résidences
                  </Button>
                </Link>
                <Link href="/customer/bookings">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white/10 border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Mes réservations
                  </Button>
                </Link>
              </div>
            </div>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Gérez vos réservations, consultez votre historique et profitez de nos services exclusifs.
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="mb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Vertical Tabs List */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200/50">
                <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-2 w-full">
                  <TabsTrigger
                    value="residences"
                    className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-theme-primary data-[state=active]:text-white text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Home className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">Résidences</span>
                  </TabsTrigger>
                  
                  <TabsTrigger
                    value="hebergement"
                    className="w-full justify-start px-4 py-3 rounded-xl data-[state=active]:bg-theme-primary data-[state=active]:text-white text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Building2 className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">Hébergement</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 overflow-hidden">
                <TabsContent value="residences" className="mt-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Mes réservations de résidences</h2>
                    <Link href="/customer/bookings">
                      <Button variant="outline" size="sm" className="hover:bg-theme-primary hover:text-white transition-all duration-300">
                        Voir toutes
                      </Button>
                    </Link>
                  </div>
                  <div className="overflow-x-auto -mx-6 px-6">
                    {isLoadingBookings ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-theme-primary mb-4" />
                        <p className="text-gray-500 text-sm">Chargement des réservations...</p>
                      </div>
                    ) : (() => {
                      const residenceBookings = bookings.filter(b => 
                        b.bookable_type?.includes('Residence') || b.bookable_type === 'App\\Models\\Residence'
                      );
                      return residenceBookings.length > 0 ? (
                        <BookingTable
                          data={residenceBookings}
                          onCancel={() => {}}
                          onDelete={() => {}}
                          isLoading={false}
                          onRefresh={() => refetchBookings()}
                          isRefreshing={isRefetchingBookings}
                          canCancel={true}
                          canDelete={false}
                          viewMode="customer"
                        />
                      ) : (
                        <div className="text-center py-16">
                          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réservation de résidence</h3>
                          <p className="text-gray-600 mb-6">Vous n&apos;avez pas encore de réservations de résidences.</p>
                          <Link href="/residences">
                            <Button className="bg-theme-primary hover:bg-theme-primary/90 text-white">
                              Explorer les résidences
                            </Button>
                          </Link>
                        </div>
                      );
                    })()}
                  </div>
                </TabsContent>

                <TabsContent value="hebergement" className="mt-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Mes visites d&apos;hébergement</h2>
                  </div>
                  <div className="overflow-x-auto -mx-6 px-6">
                    {isLoadingVisits ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-theme-primary mb-4" />
                        <p className="text-gray-500 text-sm">Chargement des visites...</p>
                      </div>
                    ) : visits.length > 0 ? (
                      <VisitTable
                        data={visits}
                        isLoading={isLoadingVisits}
                        onRefresh={() => refetchVisits()}
                        isRefreshing={isRefetchingVisits}
                        hideActions={true}
                      />
                    ) : (
                      <div className="text-center py-16">
                      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune visite d&apos;hébergement</h3>
                        <p className="text-gray-600 mb-6">Vous n&apos;avez pas encore de visites d&apos;hébergement.</p>
                    </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </section>

    </div>
  );
}

