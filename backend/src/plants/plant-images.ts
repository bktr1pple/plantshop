export function parsePlantImages(images: string | null): string[] {
  if (!images) {
    return [];
  }

  const parsed = JSON.parse(images) as unknown;
  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === 'string')
    : [];
}

export function stringifyPlantImages(images?: string[]): string {
  return JSON.stringify(images?.length ? images : []);
}
