export interface State {
  id: string;
  name: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseRoute {
  id: string;
  warehouseId: string;
  destinationStateId?: string;
  destinationLgaId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseInventory {
  id: string;
  warehouseId: string;
  productId?: string;
  quantity?: number;
  reservedQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  stateId: string;
  city: string;

  createdAt?: string;
  updatedAt?: string;

  state?: State;

  routes?: WarehouseRoute[];
  inventory?: WarehouseInventory[];
}

////////////////////////////////////////////////////////////
// DTOs
////////////////////////////////////////////////////////////

export interface CreateWarehouseDto {
  name: string;
  stateId: string;
  city: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  stateId?: string;
  city?: string;
}

////////////////////////////////////////////////////////////
// API RESPONSE TYPES
////////////////////////////////////////////////////////////

export interface CreateWarehouseResponse {
  message: string;
  warehouse: Warehouse;
}

export interface UpdateWarehouseResponse {
  message: string;
  warehouse: Warehouse;
}

export interface DeleteWarehouseResponse {
  message: string;
}

////////////////////////////////////////////////////////////
// QUERY TYPES
////////////////////////////////////////////////////////////

export interface ListWarehousesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

////////////////////////////////////////////////////////////
// PAGINATED RESPONSE
////////////////////////////////////////////////////////////

export interface PaginatedWarehousesResponse {
  warehouses: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}