export type DeliveryMethod =
  | "DOOR_DELIVERY"
  | "PICKUP"
  | "EXPRESS"
  | "STANDARD";

export interface ShippingZone {
  id: string;
  name: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  states?: {
    id: string;
    name: string;
  }[];

  lgas?: {
    id: string;
    name: string;
    stateId: string;
    state?: {
      id: string;
      name: string;
    };
  }[];

  rates?: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  zoneId: string;

  name: string;
  deliveryMethod: DeliveryMethod;

  baseFee: number;
  currency: string;

  minWeight?: number | null;
  maxWeight?: number | null;

  weightFee?: number | null;

  minDistanceKm?: number | null;
  maxDistanceKm?: number | null;

  distanceFeeKm?: number | null;

  minOrderValue?: number | null;
  maxOrderValue?: number | null;

  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;

  priority: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}