import type { Residence, ResidenceBookingData, ResidenceBookingResponse } from '@/domain/entities/residence';

export interface ResidenceFilters {
  city?: string;
  page?: number;
}

export interface ResidenceRepository {
  getAllPublic(filters?: ResidenceFilters): Promise<Residence[]>;
  getByIdPublic(id: number): Promise<Residence>;
  book(residenceId: number, data: ResidenceBookingData): Promise<ResidenceBookingResponse>;
}
