import { Outlet, useParams } from "react-router-dom";

import useBatchNotification from "@/hooks/useBatchNotification";

import { useSignalRSubscribe } from "@/lib/signalr";

function CanvasFileLayout() {
  const { fileId } = useParams();

  useSignalRSubscribe(`configuration_events:file_id:${fileId}`, [fileId]);

  useBatchNotification(fileId || "");

  return (
    <>
      <Outlet />
    </>
  );
}

export default CanvasFileLayout;
