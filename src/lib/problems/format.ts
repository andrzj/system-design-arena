export function formatProblemNumber(order: number) {
  return `#${String(order).padStart(3, '0')}`;
}
