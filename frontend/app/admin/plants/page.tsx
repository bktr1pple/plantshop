import { PlantsAdminManager } from '@/components/admin/PlantsAdminManager';
import { fetchServerPlants } from '@/lib/server-api';

export const revalidate = 0;

export default async function AdminPlantsPage() {
  const plants = await fetchServerPlants();

  return <PlantsAdminManager initialPlants={plants} />;
}
