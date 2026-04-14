import type { XYPosition } from "@xyflow/react";

interface PasteBumpState {
  lastAt: number;
  lastMouse: { x: number; y: number };
  count: number;
}

interface ComputePastePositionOptions {
  mousePosition: { x: number; y: number };
  domNode: HTMLElement | null;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
  pasteBumpState: PasteBumpState;
}

export const computePastePosition = ({
  mousePosition,
  domNode,
  screenToFlowPosition,
  pasteBumpState,
}: ComputePastePositionOptions): XYPosition => {
  const { x: mx, y: my } = mousePosition;
  const rect = domNode?.getBoundingClientRect();
  const inside = rect ? mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom : false;

  let sx = mx;
  let sy = my;

  // if mouse isn't inside pane (or never moved), use pane center
  if (!inside || (mx === 0 && my === 0)) {
    if (rect) {
      sx = rect.left + rect.width / 2;
      sy = rect.top + rect.height / 2;
    }
  }

  let base = screenToFlowPosition({ x: sx, y: sy });

  // apply a tiny bump on rapid repeated pastes at same mouse position to avoid exact overlaps
  const now = Date.now();
  const sameMouse = Math.hypot(mx - pasteBumpState.lastMouse.x, my - pasteBumpState.lastMouse.y) < 2;
  if (sameMouse && now - pasteBumpState.lastAt < 1200) {
    pasteBumpState.count += 1;
  } else {
    pasteBumpState.count = 0;
  }
  const bump = pasteBumpState.count * 20; // 20px per repeated paste
  if (bump) base = { x: base.x + bump, y: base.y + bump };
  pasteBumpState.lastAt = now;
  pasteBumpState.lastMouse = { x: mx, y: my };

  return base;
};

export const createPasteBumpState = (): PasteBumpState => ({
  lastAt: 0,
  lastMouse: { x: 0, y: 0 },
  count: 0,
});
