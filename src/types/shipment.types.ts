export const ShipmentStatus = {
  PENDING: "PENDING",

  SHIPPED: "SHIPPED",

  IN_TRANSIT: "IN_TRANSIT",

  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",

  DELIVERED: "DELIVERED",

  FAILED: "FAILED",
} as const;

export type ShipmentStatus =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const ShippingMethod = {
  STANDARD: "STANDARD",

  EXPRESS: "EXPRESS",

  SAME_DAY: "SAME_DAY",

  PICKUP_STATION: "PICKUP_STATION",
} as const;

export type ShippingMethod =
  (typeof ShippingMethod)[keyof typeof ShippingMethod];

// SHIPMENT EVENT
export interface ShipmentEvent {
  id: string;

  shipmentId: string;

  status: ShipmentStatus;

  title: string;

  description?: string | null;

  location?: string | null;

  createdAt: string;
}

// SHIPMENT
export interface Shipment {
  id: string;

  orderId: string;

  courierId: string;

  shippingRateId?: string | null;

  pickupStationId?: string | null;

  trackingNumber: string;

  status: ShipmentStatus;

  shippingMethod: ShippingMethod;

  deliveryFee: number;

  heavyItemSurcharge?: number | null;

  supportsCOD: boolean;

  fragileFee?: number | null;

  sameDayFee?: number | null;

  weight?: number | null;

  volumetricWeight?: number | null;

  chargeableWeight?: number | null;

  estimatedDays?: number | null;

  shippedAt?: string | null;

  deliveredAt?: string | null;

  notes?: string | null;

  failedReason?: string | null;

  createdAt: string;

  updatedAt: string;

  events?: ShipmentEvent[];
}

// CREATE SHIPMENT
export interface CreateShipmentInput {
  orderId: string;

  courierId: string;

  shippingRateId?: string | null;

  pickupStationId?: string | null;

  trackingNumber: string;

  status?: ShipmentStatus;

  shippingMethod: ShippingMethod;

  deliveryFee: number;

  heavyItemSurcharge?: number | null;

  supportsCOD?: boolean;

  fragileFee?: number | null;

  sameDayFee?: number | null;

  weight?: number | null;

  volumetricWeight?: number | null;

  chargeableWeight?: number | null;

  estimatedDays?: number | null;

  shippedAt?: string | Date | null;

  deliveredAt?: string | Date | null;

  notes?: string | null;

  failedReason?: string | null;
}

// UPDATE SHIPMENT
export interface UpdateShipmentInput {
  courierId?: string;

  shippingRateId?: string | null;

  pickupStationId?: string | null;

  trackingNumber?: string;

  status?: ShipmentStatus;

  shippingMethod?: ShippingMethod;

  deliveryFee?: number;

  heavyItemSurcharge?: number | null;

  supportsCOD?: boolean;

  fragileFee?: number | null;

  sameDayFee?: number | null;

  weight?: number | null;

  volumetricWeight?: number | null;

  chargeableWeight?: number | null;

  estimatedDays?: number | null;

  shippedAt?: string | Date | null;

  deliveredAt?: string | Date | null;

  notes?: string | null;

  failedReason?: string | null;
}

// UPDATE SHIPMENT STATUS
export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;

  failedReason?: string | null;

  shippedAt?: string | Date | null;

  deliveredAt?: string | Date | null;

  location?: string;
}

// PAGINATION
export interface ShipmentPagination {
  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

// GET SHIPMENTS RESPONSE
export interface GetShipmentsResponse {
  success: boolean;

  data: Shipment[];

  pagination: ShipmentPagination;
}

// SINGLE SHIPMENT RESPONSE
export interface ShipmentResponse {
  success: boolean;

  message?: string;

  data: Shipment;
}

// DELETE RESPONSE
export interface DeleteShipmentResponse {
  success: boolean;

  message: string;
}