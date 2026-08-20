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
} from "@/lib/hospitality-booking";

registerLocale("fr", fr);

export function NightClubEveningField({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  const minutes = HOSPITALITY_SLOT_MINUTES.night_club;
  const end = value ? slotEndFor(value, "night_club") : null;

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Calendar className="h-4 w-4 text-theme-primary" />
        Soirée <span className="text-red-500">*</span>
      </label>
      <p className="mb-2 text-xs text-gray-500">
        Choisissez la date et l&apos;heure d&apos;arrivée. La zone est réservée
        pour la soirée (durée standard {formatDurationLabel(minutes)}).
      </p>
      <DatePicker
        selected={value}
        onChange={(date: Date | null) => onChange(date)}
        showTimeSelect
        minDate={new Date()}
        locale="fr"
        dateFormat="dd/MM/yyyy HH:mm"
        timeFormat="HH:mm"
        timeIntervals={30}
        placeholderText="Date et heure d'arrivée"
        className="w-full border-2 border-gray-200 bg-white px-3 py-3 text-sm shadow-sm focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
        wrapperClassName="w-full"
      />
      {value && end ? (
        <div className="mt-2 flex items-start gap-2 border border-[#f08400]/25 bg-[#fff4e8] px-3 py-2 text-xs text-slate-700">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f08400]" />
          <p>
            Occupation estimée :{" "}
            <span className="font-semibold">
              {formatTimeRange(value, end)}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
