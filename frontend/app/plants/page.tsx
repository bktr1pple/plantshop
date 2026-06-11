import PlantsList from './PlantsList';
import type { PaginatedPlantsResponse, Plant } from '../types/plant';

export const revalidate = 60; // ISR

const API_BASE_URL =
  process.env.INTERNAL_API_URL ?? 'http://localhost:3001';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_SEARCH_LENGTH = 100;

type PlantsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parsePositiveInteger(value: string | string[] | undefined, fallback: number) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSearchTerm(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return (rawValue ?? '').trim().slice(0, MAX_SEARCH_LENGTH);
}

function isPaginatedPlantsResponse(value: unknown): value is PaginatedPlantsResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PaginatedPlantsResponse>;
  return Array.isArray(candidate.items) && Boolean(candidate.meta);
}

export default async function PlantsPage({ searchParams }: PlantsPageProps) {
  let plants: Plant[] = [];
  let hasLoadError = false;
  let pagination = {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const resolvedSearchParams = await searchParams;
  const page = parsePositiveInteger(resolvedSearchParams?.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(resolvedSearchParams?.limit, DEFAULT_LIMIT);
  const search = parseSearchTerm(resolvedSearchParams?.search);

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: Math.min(limit, 48).toString(),
    });

    if (search) {
      params.set('search', search);
    }

    const res = await fetch(`${API_BASE_URL}/plants?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error('Failed to fetch plants, status:', res.status);
      hasLoadError = true;
    } else {
      const data = (await res.json()) as unknown;
      if (isPaginatedPlantsResponse(data)) {
        plants = data.items;
        pagination = data.meta;
      } else if (Array.isArray(data)) {
        plants = data as Plant[];
        pagination = {
          page: DEFAULT_PAGE,
          limit: plants.length || DEFAULT_LIMIT,
          totalItems: plants.length,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        };
      } else {
        hasLoadError = true;
      }
    }
  } catch (error) {
    console.error('Error fetching plants:', error);
    hasLoadError = true;
  }

  return (
    <PlantsList
      plants={plants}
      pagination={pagination}
      searchTerm={search}
      hasLoadError={hasLoadError}
    />
  );
}
