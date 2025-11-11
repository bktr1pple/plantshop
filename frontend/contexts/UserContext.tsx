// src/contexts/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStats, Order, Plant } from '@/app/types/dashboard';

interface UserContextType {
  user: User | null;
  stats: UserStats;
  orders: Order[];
  favorites: Plant[];
  isLoading: boolean;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock data
const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  joinDate: '2024-01-15',
};

const mockStats: UserStats = {
  totalOrders: 12,
  favoritePlants: 8,
  bonusPoints: 450,
  totalSpent: 1247.50,
};

const mockOrders: Order[] = [
  {
    id: '1',
    plantName: 'Monstera Deliciosa',
    image: '/images/plants/monstera.jpg',
    price: 89.99,
    status: 'delivered',
    orderDate: '2024-03-15',
    deliveryDate: '2024-03-18',
  },
  {
    id: '2',
    plantName: 'Snake Plant',
    image: '/images/plants/snake-plant.jpg',
    price: 45.99,
    status: 'processing',
    orderDate: '2024-03-20',
  },
  {
    id: '3',
    plantName: 'Peace Lily',
    image: '/images/plants/peace-lily.jpg',
    price: 32.50,
    status: 'delivered',
    orderDate: '2024-03-10',
    deliveryDate: '2024-03-12',
  },
];

const mockFavorites: Plant[] = [
  {
    id: '1',
    name: 'Fiddle Leaf Fig',
    image: '/images/plants/fiddle-leaf.jpg',
    price: 129.99,
    category: 'Indoor',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Rubber Plant',
    image: '/images/plants/rubber-plant.jpg',
    price: 67.99,
    category: 'Indoor',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'String of Pearls',
    image: '/images/plants/string-of-pearls.jpg',
    price: 24.99,
    category: 'Succulent',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Bird of Paradise',
    image: '/images/plants/bird-of-paradise.jpg',
    price: 156.99,
    category: 'Tropical',
    rating: 4.7,
  },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch user data
    const fetchUserData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        setUser(mockUser);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const logout = () => {
    setUser(null);
    // In a real app, you would also clear tokens, etc.
    console.log('User logged out');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: UserContextType = {
    user,
    stats: mockStats,
    orders: mockOrders,
    favorites: mockFavorites,
    isLoading,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}