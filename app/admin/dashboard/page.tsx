"use client";

import React from "react";
import { Search, ChevronDown, TrendingUp, ArrowRight, Calendar, DollarSign, Users, Sparkles } from "lucide-react";

// Données du tableau de réservations
const bookings = [
  {
    id: 1,
    name: "James Gorden",
    status: "Booked",
    venue: "Avana 3",
    date: "13 March 2023",
    time: "09.00-12.00",
  },
  {
    id: 2,
    name: "John Dae",
    status: "Canceled",
    venue: "Avana 2",
    date: "13 March 2023",
    time: "09.00-12.00",
  },
  {
    id: 3,
    name: "Avery Bradly",
    status: "Booked",
    venue: "Avana 1",
    date: "13 March 2023",
    time: "09.00-12.00",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#101828] mb-2">
            Admin Reservation Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#f08400] transition-colors" />
          <input
            type="text"
            placeholder="Search bookings, venues..."
            className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#f08400] focus:border-transparent w-80 shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Booking Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">New Booking</p>
              <p className="text-4xl font-bold text-[#101828]">24</p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-4xl font-bold text-[#101828]">$ 13.450</p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Total Reserved Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Reserved</p>
              <p className="text-4xl font-bold text-[#101828]">
                90 <span className="text-xl text-gray-500 font-normal">/ 100</span>
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Booking List Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f08400] rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#101828]">
              Booking List
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200/50">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Booking Name
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                    Status
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                    Venue
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                    Date
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                    Time
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200 group cursor-pointer"
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 group-hover:text-gray-950">
                    {booking.name}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        booking.status === "Booked"
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50"
                          : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${booking.status === "Booked" ? "bg-green-500" : "bg-red-500"}`}></div>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {booking.venue}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {booking.date}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {booking.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

