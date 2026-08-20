"use client";

import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import { UseFormRegisterReturn } from "react-hook-form";
import type { IntlTelInputRef as LibraryIntlTelInputRef } from "intl-tel-input/reactWithUtils";
import { cn } from "@/lib/utils";

const IntlTelInput = dynamic(
  () => import("intl-tel-input/reactWithUtils"),
  {
    ssr: false,
    loading: () => (
      <div className="h-11 w-full animate-pulse border border-slate-200 bg-slate-50" />
    ),
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
  getSelectedCountryData: () =>
    | { iso2: string; dialCode: string; name: string }
    | Record<string, never>
    | null;
}

/**
 * IMPORTANT: intl-tel-input's React wrapper recreates its internal `update`
 * callback whenever onChangeNumber/Validity/ErrorCode identities change, then
 * re-runs an effect that calls update() again. Unstable handlers → infinite
 * setState loop → Firefox "page is slowing down".
 */
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
    const currentNumberRef = useRef<string>(value || "");
    // Capture initial value once — input is uncontrolled after mount
    const initialValueRef = useRef(value || "");

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onBlurRef = useRef(onBlur);
    onBlurRef.current = onBlur;
    const registerRef = useRef(register);
    registerRef.current = register;

    const handleChangeNumber = useCallback((number: string) => {
      const next = number || "";
      // Ignore empty init callbacks that would wipe a prefilled edit value
      if (!next && currentNumberRef.current) return;
      if (next === currentNumberRef.current) return;
      currentNumberRef.current = next;
      onChangeRef.current?.(next);
    }, []);

    const handleChangeValidity = useCallback(() => {}, []);
    const handleChangeErrorCode = useCallback(() => {}, []);

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
          if (data && Object.keys(data).length > 0 && "iso2" in data) {
            return data as { iso2: string; dialCode: string; name: string };
          }
          return null;
        }
        return null;
      },
    }));

    const handleBlur = useCallback(() => {
      onBlurRef.current?.();
      const reg = registerRef.current;
      if (reg?.onBlur) {
        const input = componentRef.current?.getInput();
        if (input) {
          reg.onBlur({
            target: input,
          } as React.FocusEvent<HTMLInputElement>);
        }
      }
    }, []);

    const initOptions = useMemo(
      () => ({
        initialCountry: (defaultCountry || "ci") as
          | "ci"
          | "fr"
          | "sn"
          | "ml"
          | "bf"
          | "ne"
          | "bj"
          | "tg",
        countryOrder: [
          "ci",
          "fr",
          "sn",
          "ml",
          "bf",
          "ne",
          "bj",
          "tg",
        ] as ("ci" | "fr" | "sn" | "ml" | "bf" | "ne" | "bj" | "tg")[],
        separateDialCode: true,
        autoPlaceholder: "polite" as const,
        formatOnDisplay: false,
        allowDropdown: true,
        nationalMode: false,
        containerClass: "phone-input-iti",
      }),
      [defaultCountry]
    );

    const inputProps = useMemo(
      () => ({
        className: cn(
          "h-11 w-full rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-none outline-none transition-colors",
          "placeholder:text-slate-400 focus:border-[#f08400] focus:ring-0",
          error && "border-red-500 focus:border-red-500",
          className
        ),
        placeholder,
        name: register?.name,
        onBlur: handleBlur,
        "aria-invalid": error,
      }),
      [className, error, handleBlur, placeholder, register?.name]
    );

    return (
      <div
        className={cn(
          "phone-input-field relative w-full min-w-0",
          error && "phone-input-field--error",
          disabled && "opacity-60"
        )}
      >
        <IntlTelInput
          ref={componentRef}
          initialValue={initialValueRef.current}
          disabled={disabled}
          onChangeNumber={handleChangeNumber}
          onChangeValidity={handleChangeValidity}
          onChangeErrorCode={handleChangeErrorCode}
          initOptions={initOptions}
          inputProps={inputProps}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
