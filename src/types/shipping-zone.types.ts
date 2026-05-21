export interface ShippingZone {
  id: string;

  name: string;

  code: string;

  description?: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;

  states?: ShippingZoneState[];

  lgas?: ShippingZoneLGA[];

  rates?: any[];
}

/* =========================================================
   SHIPPING ZONE STATE
========================================================= */

export interface ShippingZoneState {
  id: string;

  zoneId: string;

  stateId: string;

  createdAt?: string;

  updatedAt?: string;

  zone?: ShippingZone;

  state?: any;
}

/* =========================================================
   SHIPPING ZONE LGA
========================================================= */

export interface ShippingZoneLGA {
  id: string;

  zoneId: string;

  lgaId: string;

  createdAt?: string;

  updatedAt?: string;

  zone?: ShippingZone;

  lga?: any;
}

/* =========================================================
   SHIPPING ZONE INPUTS
========================================================= */

export interface CreateShippingZoneInput {
  name: string;

  code: string;

  description?: string | null;

  isActive?: boolean;
}

export interface UpdateShippingZoneInput {
  name?: string;

  code?: string;

  description?: string | null;

  isActive?: boolean;
}

/* =========================================================
   SHIPPING ZONE STATE INPUTS
========================================================= */

export interface CreateShippingZoneStateInput {
  zoneId: string;

  stateId: string;
}

export interface UpdateShippingZoneStateInput {
  zoneId?: string;

  stateId?: string;
}

/* =========================================================
   SHIPPING ZONE LGA INPUTS
========================================================= */

export interface CreateShippingZoneLGAInput {
  zoneId: string;

  lgaId: string;
}

export interface UpdateShippingZoneLGAInput {
  zoneId?: string;

  lgaId?: string;
}