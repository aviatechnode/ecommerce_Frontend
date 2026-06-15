export type FitmentType =
  | "UNIVERSAL"
  | "EXACT"
  | "RANGE"
  | "ENGINE_SPECIFIC"
  | "TRIM_SPECIFIC"
  | "OEM_MATCH"
  | "CROSS_REFERENCE"
  | "GENERATION_ONLY";

export type FitmentLevel =
  | "GLOBAL"
  | "MAKE"
  | "MODEL"
  | "GENERATION"
  | "ENGINE"
  | "TRIM"
  | "EXACT_MATCH";

// CONFIG
export type FitmentServiceConfig = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  allowUniversalFallback?: boolean;
  allowCrossGenerationMatch?: boolean;
  allowEngineFallback?: boolean;
  weightMake?: number;
  weightModel?: number;
  weightGeneration?: number;
  weightEngine?: number;
  weightTrim?: number;
  weightYear?: number;
  enableFitmentIndexing?: boolean;
  enableTextSearchFallback?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFitmentServiceConfigDto = Omit<
  FitmentServiceConfig,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateFitmentServiceConfigDto = Partial<CreateFitmentServiceConfigDto>;

// FITMENT TYPE RULES
export type FitmentTypeRule = {
  id: string;
  type: FitmentType;
  level: FitmentLevel;
  priority?: number;
  requiresMake?: boolean;
  requiresModel?: boolean;
  requiresGeneration?: boolean;
  requiresEngine?: boolean;
  requiresTrim?: boolean;
  requiresYear?: boolean;
  allowYearRange?: boolean;
  strictMatching?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFitmentTypeRuleDto = Omit<
  FitmentTypeRule,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateFitmentTypeRuleDto = Partial<CreateFitmentTypeRuleDto>;


// OEM REFERENCES
export type OEMReference = {
  id: string;
  manufacturer: string;
  partNumber: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOEMReferenceDto = Omit<
  OEMReference,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateOEMReferenceDto = Partial<CreateOEMReferenceDto>;

// CROSS REFERENCES
export type CrossReference = {
  id: string;
  brand: string;
  partNumber: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCrossReferenceDto = Omit<
  CrossReference,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCrossReferenceDto = Partial<CreateCrossReferenceDto>;

// PRODUCT FITMENTS
export type ProductFitment = {
  id: string;
  productId: string;
  level: FitmentLevel;
  type: FitmentType;
  makeId?: string;
  modelId?: string;
  generationId?: string;
  engineId?: string;
  trimId?: string;
  yearStart?: number;
  yearEnd?: number;
  notes?: string;
  position?: string;
  quantityRequired?: number;
  isUniversal?: boolean;
  isVerified?: boolean;
  confidenceScore?: number;
  createdAt?: string;
  updatedAt?: string;
  // Relations (if needed)
  oemReferences?: { oemReference: OEMReference }[];
  crossReferences?: { crossReference: CrossReference }[];
  make?: { id: string; name: string };
  model?: { id: string; name: string };
  generation?: { id: string; name: string };
  engine?: { id: string; engineCode: string };
  trim?: { id: string; name: string };
  product?: { id: string; name: string };
};

export type CreateProductFitmentDto = Omit<
  ProductFitment,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "oemReferences"
  | "crossReferences"
  | "make"
  | "model"
  | "generation"
  | "engine"
  | "trim"
  | "product"
> & {
  oemReferenceIds?: string[];
  crossReferenceIds?: string[];
};

export type UpdateProductFitmentDto = Partial<CreateProductFitmentDto>;


// RESOLUTION
export type FitmentResolutionQuery = {
  productId: string;
  makeId?: string;
  modelId?: string;
  generationId?: string;
  engineId?: string;
  trimId?: string;
  year?: number;
  oemNumbers?: string[];
};

export type FitmentResolutionResult = {
  matches: Array<{
    productId: string;
    score: number;
    level: FitmentLevel;
    type: FitmentType;
    product?: { id: string; name: string }; 
  }>;
};

// LOGS
export type FitmentResolutionLog = {
  id: string;
  productId: string;
  inputMake?: string;
  inputModel?: string;
  inputGeneration?: string;
  inputEngine?: string;
  inputTrim?: string;
  inputYear?: number;
  matched: boolean;
  matchedLevel?: FitmentLevel;
  matchedType?: FitmentType;
  score?: number;
  resolutionPath?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// PAGINATED RESPONSE
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};