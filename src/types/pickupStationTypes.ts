export interface PickupStation {
  id: string;
  name: string;
  courierId: string;
  stateId: string;
  lgaId: string;
  address: string;
  landmark?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePickupStationDTO {
  name: string;
  courierId: string;
  stateId: string;
  lgaId: string;
  address: string;
  landmark?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  isActive?: boolean;
}

export interface UpdatePickupStationDTO extends Partial<CreatePickupStationDTO> {}

export interface PickupStationQueryParams {
  page?: number;
  limit?: number;
  stateId?: string;
  lgaId?: string;
  courierId?: string;
  search?: string;
  isActive?: boolean;
}