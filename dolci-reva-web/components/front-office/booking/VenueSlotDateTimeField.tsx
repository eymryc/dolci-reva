"use client";

import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import {
  formatDurationLabel,
  formatTimeRange,
  HOSPITALITY_SLOT_MINUTES,
  slotEndFor,
  type HospitalityVertical,
} from "@/lib/hospitality-booking";

registerLocale("fr", fr);

const VERTICAL_COPY: Record<
  Exclude<HospitalityVertical, "night_club">,
  { title: string; hint: string; placeholder: string }
> = {
  restaurant: {
    title: "Date et heure d'arrivée",
    hint: "La table est réservée pour un créneau de repas. L'heure de fin est calculée automatiquement.",
    placeholder: "Choisir date et heure",
  },
  lounge: {
    title: "Date et heure d'arrivée",
    hint: "Votre table / salon est réservé pour un créneau. La fin est calculée automatiquement.",
    placeholder: "Choisir date et heure",
  },
  bar: {
    title: "Date et heure d'arrivée",
    hint: "Votre table est réservée pour un créneau. La fin est calculée automatiquement.",
    placeholder: "Choisir date et heure",
  },
};

export function VenueSlotDateTimeField({
  vertical,
  value,
  onChange,
}: {
  vertical: Exclude<HospitalityVertical, "night_club">;
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  const copy = VERTICAL_COPY[vertical];
  const minutes = HOSPITALITY_SLOT_MINUTES[vertical];
  const end = value ? slotEndFor(value, vertical) : null;

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Calendar className="h-4 w-4 text-theme-primary" />
        {copy.title} <span className="text-red-500">*</span>
      </label>
      <p className="mb-2 text-xs text-gray-500">{copy.hint}</p>
      <DatePicker
        selected={value}
        onChange={(date: Date | null) => onChange(date)}
        showTimeSelect
        minDate={new Date()}
        locale="fr"
        dateFormat="dd/MM/yyyy HH:mm"
        timeFormat="HH:mm"
        timeIntervals={30}
        placeholderText={copy.placeholder}
        className="w-full border-2 border-gray-200 bg-white px-3 py-3 text-sm shadow-sm focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
        wrapperClassName="w-full"
      />
      {value && end ? (
        <div className="mt-2 flex items-start gap-2 border border-[#f08400]/25 bg-[#fff4e8] px-3 py-2 text-xs text-slate-700">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f08400]" />
          <p>
            Créneau réservé :{" "}
            <span className="font-semibold">
              {formatTimeRange(value, end)}
            </span>{" "}
            ({formatDurationLabel(minutes)})
          </p>
        </div>
      ) : null}
    </div>
  );
}
