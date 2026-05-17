// ============================================================
// ENUMS (mirroring Prisma enums from backend)
// ============================================================

export type CouponType = 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';

export type CouponScope = 'ORDER_TOTAL' | 'SHIPPING_ONLY' | 'PRODUCT_ONLY';

export type CouponStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ARCHIVED';

export type CouponAppliesTo =
  | 'ALL_PRODUCTS'
  | 'SPECIFIC_PRODUCTS'
  | 'SPECIFIC_CATEGORIES'
  | 'SPECIFIC_CUSTOMERS';

// ============================================================
// MAIN COUPON INTERFACE (matches Prisma Coupon model)
// ============================================================

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: CouponType;
  scope: CouponScope;
  priority: number;
  internalNotes: string | null;
  amountOff: number | null;
  percentOff: number | null;
  maxDiscountAmount: number | null;
  freeShipping: boolean;
  minimumOrderAmount: number | null;
  minimumItemQuantity: number | null;
  firstOrderOnly: boolean;
  appliesTo: CouponAppliesTo;
  status: CouponStatus;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  perUserLimit: number;
  isStackable: boolean;
  excludeSaleItems: boolean;
  productIds: string[];
  categoryIds: string[];
  customerIds: string[];
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: string | null;
}

// ============================================================
// DTOs
// ============================================================

export interface CreateCouponDto {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  scope?: CouponScope;
  priority?: number;
  internalNotes?: string;
  amountOff?: number;
  percentOff?: number;
  maxDiscountAmount?: number;
  freeShipping?: boolean;
  minimumOrderAmount?: number;
  minimumItemQuantity?: number;
  firstOrderOnly?: boolean;
  appliesTo?: CouponAppliesTo;
  status?: CouponStatus;
  startsAt?: Date | string;
  expiresAt?: Date | string;
  usageLimit?: number;
  perUserLimit?: number;
  isStackable?: boolean;
  excludeSaleItems?: boolean;
  productIds?: string[];
  categoryIds?: string[];
  customerIds?: string[];
  metadata?: Record<string, any>;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

// ============================================================
// CART CONTEXT FOR VALIDATION
// ============================================================

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  isOnSale?: boolean;
  categoryId: string;
}

export interface CartContext {
  userId: string;
  items: CartItem[];
  orderSubtotal: number;
  orderTotal: number;
  isFirstOrder: boolean;
  appliedCouponIds?: string[];
}

// ============================================================
// VALIDATION RESULT
// ============================================================

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  reasons?: string[];
}

// ============================================================
// API RESPONSE WRAPPER
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  // For list endpoints
  coupons?: Coupon[];
  total?: number;
  page?: number;
  limit?: number;
  // For maintenance endpoints
  expired?: number;
  released?: number;
}

// ============================================================
// LIST QUERY PARAMS
// ============================================================

export interface ListCouponsParams {
  status?: CouponStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================
// STATS RESPONSE
// ============================================================

export interface CouponStats {
  totalRedemptions?: number;
  totalDiscountAmount?: number;
  remainingUsage?: number;
  usageCount?: number;
  reservationCount?: number;
  [key: string]: any;
}

// ============================================================
// HELPER: Convert string to enum (if needed)
// ============================================================

export function isValidCouponType(value: string): value is CouponType {
  return ['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'].includes(value);
}

export function isValidCouponStatus(value: string): value is CouponStatus {
  return ['DRAFT', 'ACTIVE', 'EXPIRED', 'DISABLED'].includes(value);
}