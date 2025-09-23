export function isWithinAspectRatio(width, height, targetRatio = 3 / 4, tolerance = 0.02) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false;
  }
  const ratio = width / height;
  const delta = Math.abs(ratio - targetRatio);
  return delta <= targetRatio * tolerance;
}
