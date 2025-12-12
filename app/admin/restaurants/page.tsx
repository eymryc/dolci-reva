"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UtensilsCrossed,
  Loader2,
  AlertCircle,
  Calendar,
  FolderTree,
  List,
} from "lucide-react";
import { AddButton } from "@/components/admin/shared/AddButton";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/context/AuthContext";
import {
  useRestaurants,
  useDeleteRestaurant,
  useAllMenuCategories,
  useAllMenuItems,
  useDeleteMenuCategory,
  useDeleteMenuItem,
  type Restaurant,
  type MenuCategory,
  type MenuItem,
} from "@/hooks/use-restaurants";
import {
  useBookings,
  useDeleteBooking,
  useCancelBooking,
  type Booking,
} from "@/hooks/use-bookings";
import { RestaurantTable } from "@/components/admin/restaurants/RestaurantTable";
import { MenuCategoryTable } from "@/components/admin/restaurants/MenuCategoryTable";
import { MenuItemTable } from "@/components/admin/restaurants/MenuItemTable";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { DeleteConfirmationDialog } from "@/components/admin/shared/DeleteConfirmationDialog";
import { MenuCategoryModal } from "@/components/admin/restaurants/MenuCategoryModal";
import { MenuItemModal } from "@/components/admin/restaurants/MenuItemModal";
import {
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  type MenuCategoryFormData,
  type MenuItemFormData,
} from "@/hooks/use-restaurants";

export default function RestaurantsPage() {
  const router = useRouter();
  const { isOwner } = usePermissions();
  const { user } = useAuth();
  
  // Vérifier le statut de vérification pour les propriétaires
  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerApproved = isOwner() 
    ? isOwnerVerified
    : true; // Les admins peuvent toujours ajouter des restaurants
  
  // Restaurants - TanStack Query
  const { 
    data: restaurants = [], 
    isLoading: isLoadingRestaurants,
    refetch: refetchRestaurants,
    isRefetching: isRefetchingRestaurants,
  } = useRestaurants();
  const deleteRestaurantMutation = useDeleteRestaurant();

  // Restaurants State
  const [isRestaurantDeleteDialogOpen, setIsRestaurantDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  // Bookings - TanStack Query
  const { 
    data: bookingsResponse, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);
  const bookings = bookingsResponse?.data || [];
  const deleteBookingMutation = useDeleteBooking();
  const cancelBookingMutation = useCancelBooking();

  // Bookings State
  const [isBookingDeleteDialogOpen, setIsBookingDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isBookingCancelDialogOpen, setIsBookingCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Menu Categories - TanStack Query
  const { 
    data: menuCategories = [], 
    isLoading: isLoadingMenuCategories,
    refetch: refetchMenuCategories,
    isRefetching: isRefetchingMenuCategories,
  } = useAllMenuCategories();
  const createMenuCategoryMutation = useCreateMenuCategory();
  const updateMenuCategoryMutation = useUpdateMenuCategory();
  const deleteMenuCategoryMutation = useDeleteMenuCategory();

  // Menu Categories State
  const [isMenuCategoryModalOpen, setIsMenuCategoryModalOpen] = useState(false);
  const [editingMenuCategory, setEditingMenuCategory] = useState<MenuCategory | null>(null);
  const [isMenuCategoryDeleteDialogOpen, setIsMenuCategoryDeleteDialogOpen] = useState(false);
  const [menuCategoryToDelete, setMenuCategoryToDelete] = useState<MenuCategory | null>(null);

  // Menu Items - TanStack Query
  const { 
    data: menuItems = [], 
    isLoading: isLoadingMenuItems,
    refetch: refetchMenuItems,
    isRefetching: isRefetchingMenuItems,
  } = useAllMenuItems();
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();

  // Menu Items State
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isMenuItemDeleteDialogOpen, setIsMenuItemDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null);

  // Restaurant Handlers
  const handleCreateRestaurant = () => {
    router.push("/admin/restaurants/new");
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    router.push(`/admin/restaurants/${restaurant.id}/edit`);
  };

  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setIsRestaurantDeleteDialogOpen(true);
  };

  const handleConfirmRestaurantDelete = () => {
    if (restaurantToDelete) {
      deleteRestaurantMutation.mutate(restaurantToDelete.id, {
        onSuccess: () => {
          setIsRestaurantDeleteDialogOpen(false);
          setRestaurantToDelete(null);
        },
      });
    }
  };

  // Booking Handlers
  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsBookingCancelDialogOpen(true);
  };

  const handleConfirmBookingCancel = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(
        { id: bookingToCancel.id },
        {
          onSuccess: () => {
            setIsBookingCancelDialogOpen(false);
            setBookingToCancel(null);
          },
        }
      );
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsBookingDeleteDialogOpen(true);
  };

  const handleConfirmBookingDelete = () => {
    if (bookingToDelete) {
      deleteBookingMutation.mutate(bookingToDelete.id, {
        onSuccess: () => {
          setIsBookingDeleteDialogOpen(false);
          setBookingToDelete(null);
        },
      });
    }
  };

  // Menu Category Handlers
  const handleCreateMenuCategory = () => {
    setEditingMenuCategory(null);
    setIsMenuCategoryModalOpen(true);
  };

  const handleEditMenuCategory = (category: MenuCategory) => {
    setEditingMenuCategory(category);
    setIsMenuCategoryModalOpen(true);
  };

  const handleSubmitMenuCategory = (data: MenuCategoryFormData) => {
    if (editingMenuCategory) {
      updateMenuCategoryMutation.mutate(
        {
          restaurantId: editingMenuCategory.restaurant_id,
          categoryId: editingMenuCategory.id,
          data,
        },
        {
          onSuccess: () => {
            setIsMenuCategoryModalOpen(false);
            setEditingMenuCategory(null);
          },
        }
      );
    } else {
      createMenuCategoryMutation.mutate(
        {
          restaurantId: data.restaurant_id,
          data,
        },
        {
          onSuccess: () => {
            setIsMenuCategoryModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteMenuCategory = (category: MenuCategory) => {
    setMenuCategoryToDelete(category);
    setIsMenuCategoryDeleteDialogOpen(true);
  };

  const handleConfirmMenuCategoryDelete = () => {
    if (menuCategoryToDelete) {
      deleteMenuCategoryMutation.mutate(
        {
          restaurantId: menuCategoryToDelete.restaurant_id,
          categoryId: menuCategoryToDelete.id,
        },
        {
          onSuccess: () => {
            setIsMenuCategoryDeleteDialogOpen(false);
            setMenuCategoryToDelete(null);
          },
        }
      );
    }
  };

  // Menu Item Handlers
  const handleCreateMenuItem = () => {
    setEditingMenuItem(null);
    setIsMenuItemModalOpen(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsMenuItemModalOpen(true);
  };

  const handleSubmitMenuItem = (data: MenuItemFormData, images?: { mainImage?: File | null; galleryImages?: File[] }) => {
    if (editingMenuItem) {
      updateMenuItemMutation.mutate(
        {
          restaurantId: editingMenuItem.restaurant_id,
          itemId: editingMenuItem.id,
          data,
          images,
        },
        {
          onSuccess: () => {
            setIsMenuItemModalOpen(false);
            setEditingMenuItem(null);
          },
        }
      );
    } else {
      createMenuItemMutation.mutate(
        {
          restaurantId: data.restaurant_id,
          data,
          images,
        },
        {
          onSuccess: () => {
            setIsMenuItemModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteMenuItem = (item: MenuItem) => {
    setMenuItemToDelete(item);
    setIsMenuItemDeleteDialogOpen(true);
  };

  const handleConfirmMenuItemDelete = () => {
    if (menuItemToDelete) {
      deleteMenuItemMutation.mutate(
        {
          restaurantId: menuItemToDelete.restaurant_id,
          itemId: menuItemToDelete.id,
        },
        {
          onSuccess: () => {
            setIsMenuItemDeleteDialogOpen(false);
            setMenuItemToDelete(null);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <Tabs defaultValue="restaurants" className="w-full">
          <div className="relative mb-6 pb-4">
            <TabsList className="inline-flex h-auto bg-transparent p-0 gap-0">
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Réservations
              </TabsTrigger>
              <TabsTrigger
                value="restaurants"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Restaurants
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <FolderTree className="w-4 h-4 mr-2" />
                Catégories
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-[#f08400]/10 data-[state=active]:text-[#f08400] text-gray-600 rounded-none px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center relative border-b-2 border-transparent data-[state=active]:!border-[#f08400] hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-b-2"
              >
                <List className="w-4 h-4 mr-2" />
                Items
              </TabsTrigger>
            </TabsList>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-gray-300"></div>
          </div>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {isLoadingBookings ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des réservations...</p>
              </div>
            ) : (
              <BookingTable
                data={bookings}
                onCancel={handleCancelBooking}
                onDelete={handleDeleteBooking}
                isLoading={deleteBookingMutation.isPending || cancelBookingMutation.isPending}
                onRefresh={() => refetchBookings()}
                isRefreshing={isRefetchingBookings}
              />
            )}

            <DeleteConfirmationDialog
              open={isBookingCancelDialogOpen}
              onOpenChange={setIsBookingCancelDialogOpen}
              onConfirm={handleConfirmBookingCancel}
              title="Annuler la réservation"
              description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action peut être réversible."
              itemName={bookingToCancel?.booking_reference || `Réservation #${bookingToCancel?.id}`}
              isLoading={cancelBookingMutation.isPending}
            />

            <DeleteConfirmationDialog
              open={isBookingDeleteDialogOpen}
              onOpenChange={setIsBookingDeleteDialogOpen}
              onConfirm={handleConfirmBookingDelete}
              title="Supprimer la réservation"
              description="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action ne peut pas être annulée."
              itemName={bookingToDelete?.booking_reference || `Réservation #${bookingToDelete?.id}`}
              isLoading={deleteBookingMutation.isPending}
            />
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-6">
            {isOwner() && !isOwnerApproved && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                      Vérification requise
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Votre compte doit être vérifié et approuvé par un administrateur avant de pouvoir ajouter des restaurants.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoadingRestaurants ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des restaurants...</p>
              </div>
            ) : (
              <RestaurantTable
                data={restaurants}
                onEdit={handleEditRestaurant}
                onDelete={handleDeleteRestaurant}
                isLoading={deleteRestaurantMutation.isPending}
                addButton={
                  isOwnerApproved ? (
                    <AddButton
                      onClick={handleCreateRestaurant}
                      label="Ajouter un restaurant"
                    />
                  ) : null
                }
                onRefresh={() => refetchRestaurants()}
                isRefreshing={isRefetchingRestaurants}
              />
            )}

            <DeleteConfirmationDialog
              open={isRestaurantDeleteDialogOpen}
              onOpenChange={setIsRestaurantDeleteDialogOpen}
              onConfirm={handleConfirmRestaurantDelete}
              title="Supprimer le restaurant"
              description="Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action ne peut pas être annulée."
              itemName={restaurantToDelete?.name || `Restaurant #${restaurantToDelete?.id}`}
              isLoading={deleteRestaurantMutation.isPending}
            />
          </TabsContent>

          {/* Menu Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {isLoadingMenuCategories ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des catégories...</p>
              </div>
            ) : (
              <MenuCategoryTable
                data={menuCategories}
                onEdit={handleEditMenuCategory}
                onDelete={handleDeleteMenuCategory}
                isLoading={deleteMenuCategoryMutation.isPending || updateMenuCategoryMutation.isPending}
                onRefresh={() => refetchMenuCategories()}
                isRefreshing={isRefetchingMenuCategories}
                addButton={
                  isOwnerApproved ? (
                    <AddButton
                      onClick={handleCreateMenuCategory}
                      label="Ajouter une catégorie"
                      isLoading={isLoadingMenuCategories}
                      disabled={isLoadingMenuCategories}
                    />
                  ) : null
                }
              />
            )}

            {/* Menu Category Modal */}
            <MenuCategoryModal
              open={isMenuCategoryModalOpen}
              onOpenChange={setIsMenuCategoryModalOpen}
              onSubmit={handleSubmitMenuCategory}
              category={editingMenuCategory}
              isLoading={createMenuCategoryMutation.isPending || updateMenuCategoryMutation.isPending}
              restaurants={restaurants}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isMenuCategoryDeleteDialogOpen}
              onOpenChange={setIsMenuCategoryDeleteDialogOpen}
              onConfirm={handleConfirmMenuCategoryDelete}
              title="Supprimer la catégorie"
              description="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action ne peut pas être annulée."
              itemName={menuCategoryToDelete?.name || `Catégorie #${menuCategoryToDelete?.id}`}
              isLoading={deleteMenuCategoryMutation.isPending}
            />
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="items" className="space-y-6">
            {isLoadingMenuItems ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des items...</p>
              </div>
            ) : (
              <MenuItemTable
                data={menuItems}
                onEdit={handleEditMenuItem}
                onDelete={handleDeleteMenuItem}
                isLoading={deleteMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                onRefresh={() => refetchMenuItems()}
                isRefreshing={isRefetchingMenuItems}
                addButton={
                  isOwnerApproved ? (
                    <AddButton
                      onClick={handleCreateMenuItem}
                      label="Ajouter un item"
                      isLoading={isLoadingMenuItems}
                      disabled={isLoadingMenuItems}
                    />
                  ) : null
                }
              />
            )}

            {/* Menu Item Modal */}
            <MenuItemModal
              open={isMenuItemModalOpen}
              onOpenChange={setIsMenuItemModalOpen}
              onSubmit={handleSubmitMenuItem}
              item={editingMenuItem}
              isLoading={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
              menuCategories={menuCategories}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={isMenuItemDeleteDialogOpen}
              onOpenChange={setIsMenuItemDeleteDialogOpen}
              onConfirm={handleConfirmMenuItemDelete}
              title="Supprimer l&apos;item"
              description="Êtes-vous sûr de vouloir supprimer cet item ? Cette action ne peut pas être annulée."
              itemName={menuItemToDelete?.name || `Item #${menuItemToDelete?.id}`}
              isLoading={deleteMenuItemMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

