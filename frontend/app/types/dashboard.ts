export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

export interface Order {
  id: string;
  plantName: string;
  image: string;
  price: number;
  status: 'delivered' | 'processing' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

export interface Plant {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  rating: number;
}

export interface UserStats {
  totalOrders: number;
  favoritePlants: number;
  bonusPoints: number;
  totalSpent: number;
}

