/* =========================================
TYPES
========================================= */

export type CheckoutAddressPayload = {
  name: string;
  phone: string;
  stateId: string;
  lgaId: string;
  city: string;
  area?: string | null;
  street: string;
  landmark?: string | null;
};

export type CheckoutPayload = {
  couponCode?: string;
  addressId?: string;
  address?: CheckoutAddressPayload;
  shippingMethod: "STANDARD" | "EXPRESS" | "SAME_DAY" | "PICKUP_STATION";
  pickupStationId?: string | null;
};

export type OrderItem = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
};

export type OrderAddress = {
  id: string;
  orderId: string;
  name: string;
  phone: string;
  stateId: string;
  lgaId: string;
  city: string;
  area: string | null;
  street: string;
  landmark: string | null;
  fullAddress: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "PARTIALLY_SHIPPED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  couponId: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: OrderAddress | null;
};

export type Shipment = {
  id: string;
  fulfillmentId: string;
  type: "OUTBOUND" | "RETURN";
  courierId: string;
  shippingRateId: string | null;
  trackingNumber: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "ARRIVED_AT_HUB"
    | "OUT_FOR_DELIVERY"
    | "LABEL_CREATED"
    | "HANDED_TO_COURIER"
    | "DELIVERED"
    | "FAILED"
    | "RETURNED"
    | "CANCELLED";
  shippingMethod: "STANDARD" | "EXPRESS" | "SAME_DAY" | "PICKUP_STATION";
  deliveryFee: number;
  weight: number | null;
  volumetricWeight: number | null;
  chargeableWeight: number | null;
  estimatedDeliveryDate: string | null;
  pickupStationId: string | null;
  handedToCourierAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  metadata: any | null;
  returnRequestId: string | null;
  orderId: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  reference: string;
  provider: "PAYSTACK" | "FLUTTERWAVE" | "STRIPE" | "BANK_TRANSFER" | "CASH_ON_DELIVERY";
  providerReference: string | null;
  gatewayResponse: any | null;
  failureReason: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED";
  paidAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutResponse = {
  message: string;
  order: Order;
  payment: Payment;
  shipment: Shipment;
  authorizationUrl: string;
};

export type DuplicateCheckoutData = {
  orderId: string;
  paymentId: string;
};

export type DuplicateCheckoutResponse = {
  message: string;
  data: DuplicateCheckoutData;
};

export type CouponPreviewPayload = {
  code: string;
  orderAmount: number;
};

export type CouponPreview = {
  valid: boolean;
  discount: number;
  finalAmount: number;
  message?: string;
};

export type ApiErrorResponse = {
  message: string;
  errors?: any;
};