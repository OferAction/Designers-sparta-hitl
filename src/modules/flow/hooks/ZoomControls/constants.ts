export const PRESET_ZOOMS = [25, 50, 75, 100, 200] as const;

export const PRESET_ZOOM_LABELS: Partial<Record<(typeof PRESET_ZOOMS)[number], string>> = {
  50: "5",
  200: "2",
};

export const MAX_ZOOM = 2.5;
export const MIN_ZOOM = 0.25;
