export type Identifiable = { id: string };

export const indexOfById = <T extends Identifiable>(list: T[], id: string): number => list.findIndex((r) => r.id === id);

export const computeInsertAt = (e: React.DragEvent, overIdx: number, fromIdx: number): number | null => {
  if (overIdx === -1 || fromIdx === -1) return null;
  if (overIdx === fromIdx) return null;
  const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const mid = bounds.top + bounds.height / 2;
  const before = e.clientY < mid;
  return before ? overIdx : overIdx + 1;
};

export const reorderWithInsert = <T>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (to > from) to -= 1;
  next.splice(to, 0, moved);
  return next;
};

export const finalizeOrder = <T extends { order?: number }>(list: T[]): T[] => list.map((r, i) => ({ ...r, order: i }));
