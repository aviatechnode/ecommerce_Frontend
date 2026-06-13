export type FuelType =
  | "PETROL"
  | "DIESEL"
  | "HYBRID"
  | "PLUG_IN_HYBRID"
  | "ELECTRIC"
  | "LPG"
  | "CNG";

export type AspirationType =
  | "NA"
  | "TURBO"
  | "TWIN_TURBO"
  | "SUPERCHARGED";

export type TransmissionType =
  | "MANUAL"
  | "AUTOMATIC"
  | "CVT"
  | "DCT";

export type DriveType =
  | "FWD"
  | "RWD"
  | "AWD"
  | "FOUR_WD";

export type BodyType =
  | "SEDAN"
  | "HATCHBACK"
  | "COUPE"
  | "CONVERTIBLE"
  | "SUV"
  | "CROSSOVER"
  | "PICKUP"
  | "WAGON"
  | "VAN"
  | "MINIVAN"
  | "MPV";

  export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  _count?: {
    models: number;
  };
}

export interface CreateVehicleMakeDto {
  name: string;
  slug: string;
  isActive?: boolean;
}

export type UpdateVehicleMakeDto =
  Partial<CreateVehicleMakeDto>;

  export interface VehicleModel {
  id: string;
  makeId: string;

  name: string;
  slug: string;

  isActive: boolean;

  make?: VehicleMake;

  createdAt: string;
  updatedAt: string;

  _count?: {
    generations: number;
  };
}

export interface CreateVehicleModelDto {
  makeId: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export type UpdateVehicleModelDto =
  Partial<CreateVehicleModelDto>;


  export interface VehicleGeneration {
  id: string;

  modelId: string;

  name: string;
  slug?: string;

  chassisCode?: string;

  yearStart: number;
  yearEnd?: number | null;

  isActive: boolean;

  model?: VehicleModel;

  createdAt: string;
  updatedAt: string;

  _count?: {
    engines: number;
  };
}

export interface CreateVehicleGenerationDto {
  modelId: string;
  name: string;

  slug?: string;
  chassisCode?: string;

  yearStart: number;
  yearEnd?: number;

  isActive?: boolean;
}

export type UpdateVehicleGenerationDto =
  Partial<CreateVehicleGenerationDto>;


  export interface VehicleEngine {
  id: string;

  generationId: string;

  engineCode: string;
  engineName?: string;

  fuelType?: FuelType;

  aspiration?: AspirationType;

  cylinders?: number;

  horsepower?: number;

  displacementCc?: number;

  displacementLabel?: string;

  drivetrain?: DriveType;

  transmissionType?: TransmissionType;

  isActive: boolean;

  generation?: VehicleGeneration;

  createdAt: string;
  updatedAt: string;

  _count?: {
    trims: number;
  };
}

export interface CreateVehicleEngineDto {
  generationId: string;
  engineCode: string;

  engineName?: string;

  fuelType?: FuelType;

  aspiration?: AspirationType;

  cylinders?: number;

  horsepower?: number;

  displacementCc?: number;

  displacementLabel?: string;

  drivetrain?: DriveType;

  transmissionType?: TransmissionType;

  isActive?: boolean;
}

export type UpdateVehicleEngineDto =
  Partial<CreateVehicleEngineDto>;

  export interface VehicleTrim {
  id: string;

  engineId: string;

  name: string;

  bodyType?: BodyType;

  doors?: number;

  isActive: boolean;

  engine?: VehicleEngine;

  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleTrimDto {
  engineId: string;

  name: string;

  bodyType?: BodyType;

  doors?: number;

  isActive?: boolean;
}

export type UpdateVehicleTrimDto =
  Partial<CreateVehicleTrimDto>;