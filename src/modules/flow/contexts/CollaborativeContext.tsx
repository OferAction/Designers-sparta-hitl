import React from "react";

import { FitViewOptions } from "@xyflow/react";

import { useHocusPocusService } from "@/services/hocusPocus/collaborativeService";

export default function CollaborativeContextProvider({
  children,
  roomName,
  fitViewOptions,
}: {
  children: React.ReactNode;
  roomName?: string;
  fitViewOptions?: Partial<FitViewOptions>;
}) {
  useHocusPocusService(roomName, fitViewOptions);

  return <>{children}</>;
}
