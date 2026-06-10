export function formatPrice(value: number): string {
  const normalized = Number.isFinite(value) ? value : 0;
  const hasFraction = Math.abs(normalized % 1) > 0.001;

  return `${new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(normalized)} ₴`;
}
