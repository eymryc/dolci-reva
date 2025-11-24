"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { useCreateVisit } from "@/hooks/use-visits";

// Styles personnalisés pour le date picker dans le modal
const datePickerStyles = `
  .visit-datepicker-calendar {
    font-family: 'Rajdhani', sans-serif;
    border: 2px solid rgb(229 231 235);
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    overflow: hidden;
  }

  .visit-datepicker-calendar .react-datepicker__header {
    background: linear-gradient(135deg, #f08400, #ff6b35);
    border-bottom: none;
    padding: 1rem 0.75rem 0.5rem;
  }

  .visit-datepicker-calendar .react-datepicker__current-month {
    color: white;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .visit-datepicker-calendar .react-datepicker__day-names {
    display: flex !important;
    justify-content: space-around;
    padding: 0.75rem 0.5rem;
    background: transparent !important;
    margin: 0;
    border-top: none !important;
  }

  .visit-datepicker-calendar .react-datepicker__day-name {
    color: #f08400 !important;
    font-weight: 700 !important;
    font-size: 0.875rem !important;
    width: 2.5rem !important;
    line-height: 2.5rem !important;
    margin: 0 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px;
    opacity: 1 !important;
    display: block !important;
    visibility: visible !important;
  }

  .visit-datepicker-calendar .react-datepicker__month {
    margin: 0.75rem 0.5rem;
  }

  .visit-datepicker-calendar .react-datepicker__week {
    display: flex;
    justify-content: space-around;
    margin: 0.25rem 0;
  }

  .visit-datepicker-calendar .react-datepicker__day {
    border-radius: 0.75rem;
    font-weight: 500;
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    margin: 0.125rem;
    transition: all 0.2s ease;
    display: inline-block;
    text-align: center;
  }

  .visit-datepicker-calendar .react-datepicker__day:hover {
    background-color: rgba(240, 132, 0, 0.15);
    transform: scale(1.05);
  }

  .visit-datepicker-calendar .react-datepicker__day--selected,
  .visit-datepicker-calendar .react-datepicker__day--keyboard-selected {
    background: linear-gradient(135deg, #f08400, #ff6b35) !important;
    color: white !important;
    font-weight: 700;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .visit-datepicker-calendar .react-datepicker__day--today {
    font-weight: 700;
    border: 2px solid #f08400;
  }

  .visit-datepicker-calendar .react-datepicker__day--disabled {
    color: rgb(209 213 219);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .visit-datepicker-calendar .react-datepicker__navigation {
    top: 1rem;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .visit-datepicker-calendar .react-datepicker__navigation:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .visit-datepicker-calendar .react-datepicker__navigation-icon::before {
    border-color: white;
    border-width: 2px 2px 0 0;
    width: 0.5rem;
    height: 0.5rem;
  }

  .visit-datepicker-calendar .react-datepicker__time-container {
    border-left: 2px solid rgb(229 231 235);
  }

  .visit-datepicker-calendar .react-datepicker__time-container .react-datepicker__time {
    background: white;
  }

  .visit-datepicker-calendar .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
    width: 100%;
  }

  .visit-datepicker-time {
    font-family: 'Rajdhani', sans-serif;
  }

  .visit-datepicker-time .react-datepicker__time-list-item {
    padding: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;
    border-radius: 0.5rem;
    margin: 0.125rem 0.5rem;
  }

  .visit-datepicker-time .react-datepicker__time-list-item:hover {
    background-color: rgba(240, 132, 0, 0.1);
  }

  .visit-datepicker-time .react-datepicker__time-list-item--selected {
    background: linear-gradient(135deg, #f08400, #ff6b35) !important;
    color: white !important;
    font-weight: 700;
  }

  .visit-datepicker-time .react-datepicker__time-list-item--disabled {
    color: rgb(209 213 219);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .visit-datepicker-calendar .react-datepicker__triangle {
    display: none;
  }
`;

// Enregistrer la locale française
registerLocale('fr', fr);

// Schéma de validation
const visitRequestSchema = z.object({
  scheduledAt: z.date({
    required_error: "La date et l'heure sont requises",
  }).refine((date) => {
    // Vérifier que la date n'est pas dans le passé
    return date > new Date();
  }, {
    message: "La date et l'heure doivent être dans le futur",
  }),
});

type VisitRequestFormValues = z.infer<typeof visitRequestSchema>;

interface VisitRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dwellingId: number;
}

export function VisitRequestModal({ open, onOpenChange, dwellingId }: VisitRequestModalProps) {
  const createVisit = useCreateVisit();

  // Injecter les styles personnalisés
  useEffect(() => {
    const styleId = 'visit-datepicker-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = datePickerStyles;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<VisitRequestFormValues>({
    resolver: zodResolver(visitRequestSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const scheduledAt = watch("scheduledAt");

  const onSubmit = async (data: VisitRequestFormValues) => {
    try {
      await createVisit.mutateAsync({
        dwelling_id: dwellingId,
        scheduled_at: data.scheduledAt.toISOString(),
      });
      
      reset();
      onOpenChange(false);
    } catch {
      // L'erreur est déjà gérée par le hook useCreateVisit
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // Calculer le minTime et maxTime selon la date sélectionnée
  const getMinTime = () => {
    if (!scheduledAt) return new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(scheduledAt);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Si la date sélectionnée est aujourd'hui, limiter à l'heure actuelle
    if (selectedDate.getTime() === today.getTime()) {
      return new Date();
    }
    // Sinon, permettre dès 8h du matin
    const minTime = new Date();
    minTime.setHours(8, 0, 0, 0);
    return minTime;
  };

  const getMaxTime = () => {
    const maxTime = new Date();
    maxTime.setHours(20, 0, 0, 0);
    return maxTime;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Demander une visite
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Sélectionnez la date et l&apos;heure souhaitées pour votre visite de cet hébergement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-theme-primary" />
                Date et heure de visite <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="scheduledAt"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy à HH:mm"
                      minDate={new Date()}
                      minTime={getMinTime()}
                      maxTime={getMaxTime()}
                      locale="fr"
                      placeholderText="Sélectionnez la date et l'heure"
                      className={`w-full h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
                        errors.scheduledAt 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50' 
                          : 'border-gray-200 focus:border-theme-primary focus:ring-theme-primary/20 bg-white hover:border-gray-300'
                      } focus:outline-none focus:ring-4 focus:ring-offset-0 shadow-sm hover:shadow-md`}
                      wrapperClassName="w-full"
                      isClearable
                      calendarClassName="visit-datepicker-calendar"
                      timeClassName={() => "visit-datepicker-time"}
                    />
                    {errors.scheduledAt && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <span>⚠️</span>
                        {errors.scheduledAt.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {scheduledAt && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Visite programmée pour :</strong>{" "}
                  {scheduledAt.toLocaleString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || createVisit.isPending}
              className="h-12"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createVisit.isPending}
              className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white h-12 font-semibold"
            >
              {isSubmitting || createVisit.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la demande"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

