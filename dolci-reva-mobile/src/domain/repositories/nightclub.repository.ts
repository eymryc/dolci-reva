import type { NightClub, NightClubBookingData, NightClubBookingResponse } from '@/domain/entities/nightclub';

export interface NightClubFilters {
  city?: string;
  search?: string;
}

export interface NightClubRepository {
  getAllPublic(filters?: NightClubFilters): Promise<NightClub[]>;
  getByIdPublic(id: number): Promise<NightClub>;
  book(nightClubId: number, data: NightClubBookingData): Promise<NightClubBookingResponse>;
}
