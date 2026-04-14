import { getViewportForBounds, Rect } from "@xyflow/react";

import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, MIN_ZOOM, MAX_ZOOM, PADDING, THUMBNAIL_TIMEOUT } from "./constants";
import { File } from "@/modules/workspace";

export const calculateThumbnailViewport = (bounds: Rect) => {
  return getViewportForBounds(bounds, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, MIN_ZOOM, MAX_ZOOM, `${PADDING}px`);
};

export const shouldUpdateThumbnail = (file: File) => {
  const thumbnailUTC = file.thumbnailUTC;
  if (!thumbnailUTC) return true;

  return Date.now() - new Date(thumbnailUTC).getTime() >= THUMBNAIL_TIMEOUT;
};
