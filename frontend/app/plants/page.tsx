import PlantsList from './PlantsList';
import { Plant } from '../types/plant';

export const revalidate = 60; // ISR

export default async function PlantsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plants` || 'http://192.168.1.2:3001/plants', {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch plants');
  }

  const plants: Plant[] = await res.json();

  return <PlantsList plants={plants} />;
}
