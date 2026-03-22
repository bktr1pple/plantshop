// app/plants/page.tsx или plants/page.tsx
import PlantsList from './PlantsList';
import type { Plant } from '../types/plant';

export const revalidate = 60; // ISR

const API_BASE_URL =
  process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

export default async function PlantsPage() {
  let plants: Plant[] = [];

  try {
    const res = await fetch(`${API_BASE_URL}/plants`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error('Failed to fetch plants, status:', res.status);
    } else {
      plants = await res.json();
    }
  } catch (error) {
    console.error('Error fetching plants:', error);
  }

  return <PlantsList plants={plants} />;
}
