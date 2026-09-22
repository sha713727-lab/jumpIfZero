const PX_PER_SECOND = 180;
const MIN_DURATION_MS = 3000;
const MAX_DURATION_MS = 12000;

export function previewScrollDistance(
  renderedHeight: number,
  containerHeight: number,
): number {
  return Math.max(0, renderedHeight - containerHeight);
}

export function previewDurationMs(distance: number): number {
  if (distance <= 0) {
    return MIN_DURATION_MS;
  }
  const raw = (distance / PX_PER_SECOND) * 1000;
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, raw));
}
