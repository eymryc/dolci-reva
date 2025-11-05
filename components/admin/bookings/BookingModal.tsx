"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookingForm } from "./BookingForm";
import { Booking, BookingFormData } from "@/hooks/use-bookings";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BookingFormData) => void;
  booking?: Booking | null;
  isLoading?: boolean;
}

export function BookingModal({
  open,
  onOpenChange,
  onSubmit,
  booking,
  isLoading = false,
}: BookingModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-[#f08400]">
            {booking ? "Modifier la réservation" : "Créer une réservation"}
          </DialogTitle>
          <DialogDescription>
            {booking
              ? "Mettez à jour les informations de la réservation ci-dessous."
              : "Remplissez les informations ci-dessous pour créer une nouvelle réservation."}
          </DialogDescription>
        </DialogHeader>
        <BookingForm
          onSubmit={onSubmit}
          onCancel={handleCancel}
          defaultValues={
            booking
              ? {
                  name: `${booking.customer.first_name} ${booking.customer.last_name}`,
                  venue: booking.bookable.name,
                  date: booking.start_date.split('T')[0],
                  time: booking.start_date.split('T')[1]?.substring(0, 5) || '',
                }
              : undefined
          }
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

