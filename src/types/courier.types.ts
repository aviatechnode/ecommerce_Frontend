export interface Courier {
  id: string;

  name: string;

  phone?: string | null;

  email?: string | null;

  website?: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;

  rates?: any[];

  shipments?: any[];
}

export interface CreateCourierInput {
  name: string;

  phone?: string;

  email?: string;

  website?: string;

  isActive?: boolean;
}

export interface UpdateCourierInput {
  name?: string;

  phone?: string;

  email?: string;

  website?: string;

  isActive?: boolean;
}