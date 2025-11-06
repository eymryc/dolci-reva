import { useState, useCallback } from "react";
import { UseFormSetError, FieldValues, Path } from "react-hook-form";

interface ServerErrorResponse {
  response?: {
    data?: {
      message?: string;
      data?: unknown;
    };
  };
}

interface UseServerErrorsOptions<T extends FieldValues> {
  setError: UseFormSetError<T>;
  fieldMapping?: Record<string, Path<T>>;
  onErrorsSet?: (errors: Record<string, string[]>) => void;
}

export function useServerErrors<T extends FieldValues>({
  setError,
  fieldMapping = {},
  onErrorsSet,
}: UseServerErrorsOptions<T>) {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [showErrorPanel, setShowErrorPanel] = useState(false);

  const handleServerError = useCallback(
    (error: unknown) => {
      const newServerErrors: Record<string, string[]> = {};
      let errorMessage = "Une erreur est survenue";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as ServerErrorResponse;

        // Afficher les erreurs dans la console pour le débogage
        console.log("Erreurs du serveur:", axiosError.response?.data?.data);

        // Si des erreurs détaillées existent dans data.data
        if (axiosError.response?.data?.data) {
          const errors = axiosError.response.data.data;

          // Si c'est un objet avec des erreurs par champ
          if (typeof errors === "object" && !Array.isArray(errors) && errors !== null) {
            Object.entries(errors).forEach(([field, messages]) => {
              const formField = fieldMapping[field];
              const errorMessages = Array.isArray(messages)
                ? messages.map((msg) => String(msg))
                : [String(messages)];

              // Stocker les erreurs pour le panneau
              newServerErrors[field] = errorMessages;

              // Définir l'erreur sur le champ correspondant dans react-hook-form
              if (formField) {
                setError(formField, {
                  type: "server",
                  message: errorMessages[0],
                });
              }
            });

            // Afficher le panneau d'erreurs
            setServerErrors(newServerErrors);
            setShowErrorPanel(true);

            // Appeler le callback si fourni
            if (onErrorsSet) {
              onErrorsSet(newServerErrors);
            }

            // Message d'erreur général pour le toast
            const errorMessages = Object.entries(newServerErrors)
              .map(([field, messages]) => {
                const fieldName = fieldMapping[field] || field;
                return `${fieldName}: ${messages.join(", ")}`;
              })
              .join(" | ");

            if (errorMessages) {
              errorMessage = errorMessages;
            }
          } else if (Array.isArray(errors)) {
            // Si c'est un tableau d'erreurs
            errorMessage = errors.join(" | ");
          } else {
            // Si c'est une chaîne simple
            errorMessage = String(errors);
          }
        } else {
          // Sinon, utiliser le message par défaut
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      }

      return {
        errorMessage,
        hasDetailedErrors: Object.keys(newServerErrors).length > 0,
      };
    },
    [setError, fieldMapping, onErrorsSet]
  );

  const clearErrors = useCallback(() => {
    setServerErrors({});
    setShowErrorPanel(false);
  }, []);

  return {
    serverErrors,
    showErrorPanel,
    handleServerError,
    clearErrors,
    setShowErrorPanel,
  };
}

