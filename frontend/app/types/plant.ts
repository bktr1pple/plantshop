export interface Plant {
  id: number;
  name: string;
  description: string | null;
  price: number;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlantsPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  search?: string | null;
}

export interface PaginatedPlantsResponse {
  items: Plant[];
  meta: PlantsPaginationMeta;
}
