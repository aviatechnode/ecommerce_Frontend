export type FitmentLevel =
  | "MAKE"
  | "MODEL"
  | "GENERATION"
  | "ENGINE"
  | "TRIM";

export interface ProductFitment {
  id: string;

  productId: string;

  level: FitmentLevel;

  makeId?: string | null;

  modelId?: string | null;

  generationId?: string | null;

  engineId?: string | null;

  trimId?: string | null;

  yearStart?: number | null;

  yearEnd?: number | null;

  notes?: string | null;

  position?: string | null;

  quantityRequired?: number | null;

  isUniversal: boolean;
}

export interface VehicleMake {
  id: string;

  name: string;

  slug: string;

  isActive: boolean;

  models?: VehicleModel[];
}

export interface VehicleModel {
  id: string;

  makeId: string;

  name: string;

  slug: string;

  isActive: boolean;

  generations?: VehicleGeneration[];
}

export interface VehicleGeneration {
  id: string;

  modelId: string;

  name: string;

  slug: string;

  chassisCode?: string | null;

  yearStart: number;

  yearEnd?: number | null;

  isActive: boolean;

  engines?: VehicleEngine[];
}

export interface VehicleEngine {
  id: string;

  generationId: string;

  engineCode: string;

  engineName?: string | null;

  fuelType?: string | null;

  aspiration?: string | null;

  cylinders?: number | null;

  horsepower?: number | null;

  displacementCc?: number | null;

  displacementLabel?: string | null;

  drivetrain?: string | null;

  transmissionType?: string | null;

  isActive: boolean;

  trims?: VehicleTrim[];
}

export interface VehicleTrim {
  id: string;

  engineId: string;

  name: string;

  bodyType?: string | null;

  doors?: number | null;

  isActive: boolean;
}