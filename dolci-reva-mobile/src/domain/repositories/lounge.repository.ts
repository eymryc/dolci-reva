import type { Lounge, LoungeBookingData, LoungeBookingResponse } from '@/domain/entities/lounge';

export interface LoungeFilters {
  city?: string;
  search?: string;
}

export interface LoungeRepository {
  getAllLounges(filters?: LoungeFilters): Promise<Lounge[]>;
  getAllBars(filters?: LoungeFilters): Promise<Lounge[]>;
  getByIdPublic(id: number): Promise<Lounge>;
  book(loungeId: number, data: LoungeBookingData): Promise<LoungeBookingResponse>;
}
