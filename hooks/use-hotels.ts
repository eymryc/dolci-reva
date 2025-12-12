/**
 * Hooks pour la gestion des hôtels et chambres
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePermissions } from "./use-permissions";
import { useAuth } from "@/context/AuthContext";
import { handleError } from "@/lib/error-handler";
import { hotelService } from "@/services/hotel.service";
import type {
  Hotel,
  HotelFormData,
  HotelRoom,
  HotelRoomFormData,
} from "@/types/entities/hotel.types";

// Réexporter les types
export type { Hotel, HotelFormData, HotelRoom, HotelRoomFormData };

// ========== Hôtels ==========

/**
 * Récupère tous les hôtels
 */
export function useHotels() {
  const { isOwner } = usePermissions();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hotels"],
    queryFn: () => {
      const params = isOwner() && user?.id ? { owner_id: user.id } : undefined;
      return hotelService.getAll(params);
    },
  });
}

/**
 * Récupère un hôtel par ID
 */
export function useHotel(id: number) {
  return useQuery({
    queryKey: ["hotels", id],
    queryFn: () => hotelService.getById(id),
    enabled: !!id,
  });
}

/**
 * Crée un nouvel hôtel
 */
export function useCreateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      images,
    }: {
      data: HotelFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => hotelService.create(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success("Hôtel créé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de l'hôtel" });
    },
  });
}

/**
 * Met à jour un hôtel
 */
export function useUpdateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      images,
    }: {
      id: number;
      data: HotelFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => hotelService.update(id, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      queryClient.invalidateQueries({ queryKey: ["hotels", variables.id] });
      toast.success("Hôtel modifié avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification de l'hôtel" });
    },
  });
}

/**
 * Supprime un hôtel
 */
export function useDeleteHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hotelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success("Hôtel supprimé avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de l'hôtel" });
    },
  });
}

// ========== Chambres ==========

/**
 * Récupère toutes les chambres d'un hôtel
 */
export function useHotelRooms(hotelId?: number) {
  return useQuery({
    queryKey: ["hotels", hotelId, "rooms"],
    queryFn: () => {
      if (hotelId) {
        return hotelService.getRooms(hotelId);
      }
      return hotelService.getAllRooms();
    },
    enabled: hotelId !== undefined,
  });
}

/**
 * Récupère toutes les chambres (admin)
 */
export function useAllHotelRooms() {
  return useQuery({
    queryKey: ["hotels", "rooms"],
    queryFn: () => hotelService.getAllRooms(),
  });
}

/**
 * Récupère une chambre par ID
 */
export function useHotelRoom(roomId: number) {
  return useQuery({
    queryKey: ["hotels", "rooms", roomId],
    queryFn: () => hotelService.getRoomById(roomId),
    enabled: !!roomId,
  });
}

/**
 * Crée une nouvelle chambre
 */
export function useCreateHotelRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      images,
    }: {
      data: HotelRoomFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => hotelService.createRoom(data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hotels", "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotels", variables.data.hotel_id, "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success("Chambre créée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la création de la chambre" });
    },
  });
}

/**
 * Met à jour une chambre
 */
export function useUpdateHotelRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      data,
      images,
    }: {
      roomId: number;
      data: HotelRoomFormData;
      images?: { mainImage?: File | null; galleryImages?: File[] };
    }) => hotelService.updateRoom(roomId, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hotels", "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotels", "rooms", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["hotels", variables.data.hotel_id, "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success("Chambre modifiée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la modification de la chambre" });
    },
  });
}

/**
 * Supprime une chambre
 */
export function useDeleteHotelRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId }: { roomId: number }) =>
      hotelService.deleteRoom(roomId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hotels", "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotels", "rooms", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      toast.success("Chambre supprimée avec succès !");
    },
    onError: (error: unknown) => {
      handleError(error, { defaultMessage: "Échec de la suppression de la chambre" });
    },
  });
}

