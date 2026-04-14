import { NodePositionChange } from "@xyflow/react";

import { Node } from "../types";

export type CollisionAlgorithmOptions = {
  maxIterations: number;
  overlapThreshold: number;
  margin: number;
};

export type CollisionAlgorithm = (nodes: Node[], options: CollisionAlgorithmOptions) => NodePositionChange[];

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
  moved: boolean;
  node: Node;
};

function getBoxesFromNodes(nodes: Node[], margin: number = 0): Box[] {
  const boxes: Box[] = new Array(nodes.length);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    boxes[i] = {
      x: node.position.x - margin,
      y: node.position.y - margin,
      width: (node.measured?.width ?? node.width ?? 0) + margin * 2,
      height: (node.measured?.height ?? node.height ?? 0) + margin * 2,
      node,
      moved: false,
    };
  }

  return boxes;
}

export const resolveCollisions: CollisionAlgorithm = (nodes, { maxIterations = 50, overlapThreshold = 0.5, margin = 0 }) => {
  const boxes = getBoxesFromNodes(nodes, margin);

  for (let iter = 0; iter <= maxIterations; iter++) {
    let moved = false;

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i];
        const B = boxes[j];

        // Calculate center positions (because the node origin is [0.5, 0.5] in the canvas props there is no need to offset)
        const centerAX = A.x;
        const centerAY = A.y;
        const centerBX = B.x;
        const centerBY = B.y;

        // Calculate distance between centers
        const dx = centerAX - centerBX;
        const dy = centerAY - centerBY;

        // Calculate overlap along each axis
        const px = (A.width + B.width) * 0.5 - Math.abs(dx);
        const py = (A.height + B.height) * 0.5 - Math.abs(dy);

        // Check if there's significant overlap
        if (px > overlapThreshold && py > overlapThreshold) {
          A.moved = B.moved = moved = true;

          // Calculate mass ratio based on area (larger nodes have more "mass")
          const areaA = A.width * A.height;
          const areaB = B.width * B.height;
          const totalArea = areaA + areaB;

          // Inverse ratio: smaller nodes move more, larger nodes move less
          const ratioA = areaB / totalArea;
          const ratioB = areaA / totalArea;

          // Resolve along the smallest overlap axis
          if (px < py) {
            // Move along x-axis
            const sx = dx > 0 ? 1 : -1;
            A.x += px * ratioA * sx;
            B.x -= px * ratioB * sx;
          } else {
            // Move along y-axis
            const sy = dy > 0 ? 1 : -1;
            A.y += py * ratioA * sy;
            B.y -= py * ratioB * sy;
          }
        }
      }
    }

    // Early exit if no overlaps were found
    if (!moved) {
      break;
    }
  }

  const positionChanges: NodePositionChange[] = boxes
    .filter((box) => box.moved)
    .map((box) => ({
      id: box.node.id,
      type: "position" as const,
      position: {
        x: box.x + margin,
        y: box.y + margin,
      },
    }));

  return positionChanges;
};

export const applyCollisionResolution = (nodes: Node[]) => {
  const hasDragging = nodes.some((node) => node.dragging === true);

  if (hasDragging) return [];

  const positionChanges = resolveCollisions(nodes, {
    maxIterations: 50,
    overlapThreshold: 0.5,
    margin: 25,
  });

  // If no position changes, return original nodes
  if (positionChanges.length === 0) return [];

  return positionChanges;
};
