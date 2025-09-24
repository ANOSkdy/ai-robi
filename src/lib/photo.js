export function isWithinAspectRatio(width, height, targetRatio = 3 / 4, tolerance = 0.02) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false;
  }
  const ratio = width / height;
  const delta = Math.abs(ratio - targetRatio);
  return delta <= targetRatio * tolerance;
}

export function calculateCropBox(width, height, targetRatio = 3 / 4) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { sx: 0, sy: 0, sw: 0, sh: 0 };
  }

  const ratio = width / height;

  if (ratio > targetRatio) {
    const sh = height;
    const sw = Math.min(Math.round(sh * targetRatio), width);
    const sx = Math.max(0, Math.round((width - sw) / 2));
    return { sx, sy: 0, sw, sh };
  }

  const sw = width;
  const estimatedSh = sw / targetRatio;
  const sh = Math.min(Math.round(estimatedSh), height);
  const syRaw = (height - sh) / 2;
  const sy = Math.max(0, Math.min(Math.round(syRaw), height - sh));
  return { sx: 0, sy, sw, sh };
}
