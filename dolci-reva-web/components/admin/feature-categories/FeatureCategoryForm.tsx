"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LucideIconByName } from "@/components/ui/LucideIconByName";
import { useEstablishmentTypes, type FeatureCategoryFormData } from "@/hooks/use-feature-categories";
import type { FeatureCategory } from "@/types/common";

interface FeatureCategoryFormProps {
  category?: FeatureCategory | null;
  onSubmit: (data: FeatureCategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FeatureCategoryForm({ category, onSubmit, onCancel, isLoading = false }: FeatureCategoryFormProps) {
  const { data: establishmentTypes = [] } = useEstablishmentTypes();
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(category?.establishment_types ?? []);
  const [error, setError] = useState<string | null>(null);

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de la catégorie est requis.");
      return;
    }
    if (selectedTypes.length === 0) {
      setError("Sélectionnez au moins un type d'établissement.");
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      icon: icon.trim() || undefined,
      establishment_types: selectedTypes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="fc-name">
          Nom <span className="text-red-500">*</span>
        </Label>
        <Input id="fc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Vues, Literie..." className="h-12" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fc-icon">Icône (optionnel, nom lucide-react)</Label>
        <div className="flex items-center gap-2">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#f08400]/20 bg-[#fffaf5] text-[#f08400]">
            <LucideIconByName name={icon || null} className="h-5 w-5" />
          </span>
          <Input
            id="fc-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Ex : eye, bed, wifi, utensils"
            className="h-12"
          />
        </div>
        <p className="text-xs text-gray-500">
          Noms kebab-case Lucide : <code className="text-[#f08400]">wifi</code>,{" "}
          <code className="text-[#f08400]">concierge-bell</code>,{" "}
          <code className="text-[#f08400]">shield-check</code>…
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Types d&apos;établissement concernés <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3">
          {establishmentTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <Checkbox
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => toggleType(type.value)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="h-12">
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12">
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
