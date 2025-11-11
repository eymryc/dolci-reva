"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { UseFormRegisterReturn } from "react-hook-form";
import type { IntlTelInputRef as LibraryIntlTelInputRef } from "intl-tel-input/reactWithUtils";

// Import dynamique pour éviter les problèmes SSR
const IntlTelInput = dynamic(
  () => import("intl-tel-input/reactWithUtils"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-14 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm animate-pulse" />
    )
  }
);

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  defaultCountry?: "ci" | "fr" | "sn" | "ml" | "bf" | "ne" | "bj" | "tg" | string;
  register?: UseFormRegisterReturn;
  error?: boolean;
  disabled?: boolean;
}

export interface PhoneInputRef {
  getNumber: () => string;
  getNumberType: () => number;
  isValidNumber: () => boolean;
  getSelectedCountryData: () => { iso2: string; dialCode: string; name: string } | Record<string, never> | null;
}

const PhoneInput = forwardRef<PhoneInputRef, PhoneInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      className = "",
      placeholder = "Entrez votre numéro",
      defaultCountry = "ci",
      register,
      error = false,
      disabled = false,
    },
    ref
  ) => {
    const componentRef = useRef<LibraryIntlTelInputRef | null>(null);
    const currentNumberRef = useRef<string>("");

    // Gestionnaire pour onChangeNumber - retourne le numéro au format E.164
    const handleChangeNumber = (number: string) => {
      currentNumberRef.current = number || "";
      if (onChange && number) {
        // onChangeNumber retourne déjà le numéro au format E.164 avec l'indicatif
        onChange(number);
      }
    };

    // Gestionnaire pour onChangeValidity (optionnel, pour validation)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleChangeValidity = (_isValid: boolean) => {
      // Vous pouvez utiliser cette info pour la validation si nécessaire
    };

    // Gestionnaire pour onChangeErrorCode (optionnel)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleChangeErrorCode = (_errorCode: number | null) => {
      // Vous pouvez utiliser cette info pour afficher des erreurs si nécessaire
    };

    // Exposer les méthodes via ref
    useImperativeHandle(ref, () => ({
      getNumber: () => {
        if (componentRef.current) {
          const instance = componentRef.current.getInstance();
          return instance?.getNumber() || currentNumberRef.current || "";
        }
        return currentNumberRef.current || "";
      },
      getNumberType: () => {
        if (componentRef.current) {
          const instance = componentRef.current.getInstance();
          return instance?.getNumberType() || -1;
        }
        return -1;
      },
      isValidNumber: () => {
        if (componentRef.current) {
          const instance = componentRef.current.getInstance();
          return instance?.isValidNumber() || false;
        }
        return false;
      },
      getSelectedCountryData: () => {
        if (componentRef.current) {
          const instance = componentRef.current.getInstance();
          const data = instance?.getSelectedCountryData();
          // Vérifier si c'est un EmptyObject (objet vide)
          if (data && Object.keys(data).length > 0 && 'iso2' in data) {
            return data as { iso2: string; dialCode: string; name: string };
          }
          return null;
        }
        return null;
      },
    }));

    const handleBlur = () => {
      if (onBlur) {
        onBlur();
      }
      if (register?.onBlur) {
        const input = componentRef.current?.getInput();
        if (input) {
          register.onBlur({ target: input } as React.FocusEvent<HTMLInputElement>);
        }
      }
    };

    return (
      <div className="relative w-full">
        <IntlTelInput
          ref={componentRef}
          initialValue={value}
          disabled={disabled}
          onChangeNumber={handleChangeNumber}
          onChangeValidity={handleChangeValidity}
          onChangeErrorCode={handleChangeErrorCode}
          initOptions={{
            initialCountry: defaultCountry as "ci" | "fr" | "sn" | "ml" | "bf" | "ne" | "bj" | "tg" | undefined,
            countryOrder: ["ci", "fr", "sn", "ml", "bf", "ne", "bj", "tg"],
            separateDialCode: true,
            autoPlaceholder: "polite",
            formatOnDisplay: false,
            allowDropdown: true,
            nationalMode: false,
          }}
          inputProps={{
            className: `w-full ${className}`,
            placeholder: placeholder,
            name: register?.name,
            onBlur: handleBlur,
            "aria-invalid": error,
          }}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;

