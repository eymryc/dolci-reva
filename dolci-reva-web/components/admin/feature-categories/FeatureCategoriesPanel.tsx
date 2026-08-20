"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideIconByName } from "@/components/ui/LucideIconByName";
import { AddButton } from "@/components/admin/shared/AddButton";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { FeatureCategoryModal } from "./FeatureCategoryModal";
import {
  useFeatureCategories,
  useEstablishmentTypes,
  useCreateFeatureCategory,
  useUpdateFeatureCategory,
  useDeleteFeatureCategory,
  useCreateFeatureOption,
  useDeleteFeatureOption,
  type FeatureCategoryFormData,
} from "@/hooks/use-feature-categories";
import type { FeatureCategory } from "@/types/common";

/**
 * Remplace l'ancien onglet "Commodité" (concept Amenity, plat, supprimé) :
 * gère le catalogue FeatureCategory/FeatureOption utilisé par tous les
 * formulaires d'établissement (résidences, hôtels, restaurants, lounges...).
 */
export function FeatureCategoriesPanel() {
  const { data: categories = [], isLoading } = useFeatureCategories();
  const { data: establishmentTypes = [] } = useEstablishmentTypes();

  const createCategory = useCreateFeatureCategory();
  const updateCategory = useUpdateFeatureCategory();
  const deleteCategory = useDeleteFeatureCategory();
  const createOption = useCreateFeatureOption();
  const deleteOption = useDeleteFeatureOption();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeatureCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<FeatureCategory | null>(null);
  const [newOptionNameByCategory, setNewOptionNameByCategory] = useState<Record<number, string>>({});

  const typeLabel = (value: string) => establishmentTypes.find((t) => t.value === value)?.label ?? value;

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: FeatureCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCategory = (data: FeatureCategoryFormData) => {
    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data },
        { onSuccess: () => setIsCategoryModalOpen(false) }
      );
    } else {
      createCategory.mutate(data, { onSuccess: () => setIsCategoryModalOpen(false) });
    }
  };

  const handleAddOption = (categoryId: number) => {
    const name = (newOptionNameByCategory[categoryId] || "").trim();
    if (!name) return;
    createOption.mutate(
      { feature_category_id: categoryId, name },
      { onSuccess: () => setNewOptionNameByCategory((prev) => ({ ...prev, [categoryId]: "" })) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
        <p className="text-gray-500 text-sm">Chargement du catalogue d&apos;équipements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton onClick={handleCreateCategory} label="Ajouter une catégorie" />
      </div>

      {categories.length === 0 ? (
        <div className="flex items-center justify-center py-16 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 text-sm">Aucune catégorie d&apos;équipements pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="flex items-center gap-2.5 font-semibold text-gray-900">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#f08400]/10 text-[#f08400]">
                      <LucideIconByName name={category.icon} className="h-4 w-4" />
                    </span>
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1 pl-10">
                    {(category.establishment_types ?? []).map((type) => (
                      <span key={type} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {typeLabel(type)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)} aria-label="Modifier la catégorie">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCategoryToDelete(category)} aria-label="Supprimer la catégorie">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {category.options.map((option) => (
                  <span
                    key={option.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {option.name}
                    <button
                      type="button"
                      onClick={() => deleteOption.mutate(option.id)}
                      aria-label={`Supprimer l'option ${option.name}`}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {category.options.length === 0 && (
                  <span className="text-xs text-gray-400 italic">Aucune option pour l&apos;instant</span>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddOption(category.id);
                }}
                className="flex gap-2"
              >
                <Input
                  value={newOptionNameByCategory[category.id] || ""}
                  onChange={(e) =>
                    setNewOptionNameByCategory((prev) => ({ ...prev, [category.id]: e.target.value }))
                  }
                  placeholder="Nouvelle option (ex : Vue sur mer)"
                  className="h-9 text-sm"
                />
                <Button type="submit" size="sm" variant="outline" disabled={createOption.isPending}>
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      <FeatureCategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSubmit={handleSubmitCategory}
        category={editingCategory}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />

      <DeleteConfirmationDialog
        open={categoryToDelete !== null}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory.mutate(categoryToDelete.id, { onSuccess: () => setCategoryToDelete(null) });
          }
        }}
        title="Supprimer la catégorie"
        description="Supprimer cette catégorie retire aussi toutes ses options du catalogue. Cette action ne peut pas être annulée."
        itemName={categoryToDelete?.name}
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
