/**
 * Section d'adresse avec autocomplétion du formulaire d'hébergement
 */

import React, { useState, useRef, useEffect } from "react";
import { UseFormSetValue, UseFormWatch, FieldErrors, Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import type { AddressSuggestion } from "@/hooks/use-address-autocomplete";
import type { DwellingFormValues } from "../DwellingForm";

interface AddressSectionProps {
  setValue: UseFormSetValue<DwellingFormValues>;
  watch: UseFormWatch<DwellingFormValues>;
  control: Control<DwellingFormValues>;
  errors: FieldErrors<DwellingFormValues>;
  defaultAddress?: string;
}

export function AddressSection({ 
  setValue, 
  watch, 
  control,
  errors, 
  defaultAddress 
}: AddressSectionProps) {
  const addressInputRef = useRef<HTMLDivElement>(null);
  const [localAddressValue, setLocalAddressValue] = useState(defaultAddress || "");
  const [addressSelected, setAddressSelected] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { suggestions, loading: loadingAddress } = useAddressAutocomplete(
    localAddressValue,
    2
  );

  const address = watch("address");

  useEffect(() => {
    if (defaultAddress) {
      setLocalAddressValue(defaultAddress);
    }
  }, [defaultAddress]);

  useEffect(() => {
    if (address && !addressSelected) {
      setLocalAddressValue(address);
    }
  }, [address, addressSelected]);

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    const props = suggestion.properties;
    const fullAddress = [
      props.housenumber && props.street ? `${props.housenumber} ${props.street}` : props.street || props.name,
      props.district,
      props.city,
      props.country,
    ]
      .filter(Boolean)
      .join(", ");

    setLocalAddressValue(fullAddress);
    setValue("address", fullAddress);
    setValue("city", props.city || "");
    setValue("country", props.country || "Côte d'Ivoire");
    setValue("latitude", suggestion.geometry.coordinates[1]);
    setValue("longitude", suggestion.geometry.coordinates[0]);
    setAddressSelected(true);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Adresse
      </h3>

      <div ref={addressInputRef} className="relative">
        <Label htmlFor="address">Adresse *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="address"
            value={localAddressValue}
            onChange={(e) => {
              setLocalAddressValue(e.target.value);
              setValue("address", e.target.value);
              setAddressSelected(false);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
            placeholder="Commencez à taper une adresse..."
          />
        </div>
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {loadingAddress && (
              <div className="p-2 text-sm text-gray-500">Chargement...</div>
            )}
            {suggestions.map((suggestion, index) => {
              const props = suggestion.properties;
              const displayText = [
                props.housenumber && props.street ? `${props.housenumber} ${props.street}` : props.street || props.name,
                props.district,
                props.city,
                props.country,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddressSelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  {displayText}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="city">Ville *</Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                id="city"
                {...field}
                className={errors.city ? "border-red-500" : ""}
              />
            )}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Pays *</Label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Input
                id="country"
                {...field}
                className={errors.country ? "border-red-500" : ""}
              />
            )}
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Controller
            name="latitude"
            control={control}
            render={({ field }) => (
              <Input
                id="latitude"
                type="number"
                step="any"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Ex: 5.3600"
              />
            )}
          />
          {errors.latitude && (
            <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Controller
            name="longitude"
            control={control}
            render={({ field }) => (
              <Input
                id="longitude"
                type="number"
                step="any"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Ex: -4.0083"
              />
            )}
          />
          {errors.longitude && (
            <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

