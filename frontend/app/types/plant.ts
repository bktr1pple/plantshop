export interface Plant {
  id: number;
  name: string;
  description: string | null;
  price: number;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}
