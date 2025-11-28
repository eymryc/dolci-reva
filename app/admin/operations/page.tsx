"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function OperationsPage() {
  const depotsColumns = [
    "Référence",
    "Montant",
    "Méthode",
    "Statut",
    "Date",
    "Actions"
  ];

  const retraitColumns = [
    "Référence",
    "Montant",
    "Compte",
    "Statut",
    "Date",
    "Actions"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] mb-2">
            Mes opérations
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Gérez vos dépôts et retraits
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <Tabs defaultValue="depots" className="w-full">
          <div className="relative mb-6 pb-4 px-6 pt-6">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="depots"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Dépôts
              </TabsTrigger>
              <TabsTrigger
                value="retrait"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Retrait
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Dépôts Tab */}
          <TabsContent value="depots" className="space-y-6 px-6 pb-6">
            <div className="rounded-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <tr>
                      {depotsColumns.map((column, index) => (
                        <th
                          key={index}
                          className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    <tr>
                      <td colSpan={depotsColumns.length} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                        Aucune donnée
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Retrait Tab */}
          <TabsContent value="retrait" className="space-y-6 px-6 pb-6">
            <div className="rounded-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <tr>
                      {retraitColumns.map((column, index) => (
                        <th
                          key={index}
                          className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    <tr>
                      <td colSpan={retraitColumns.length} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                        Aucune donnée
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

