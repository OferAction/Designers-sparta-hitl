import { useViewport } from "@xyflow/react";
import { CursorIcon as MousePointer2Icon } from "@phosphor-icons/react";

import hocusPocusServiceSingleton from "@/services/hocusPocus/collaborativeService";
import { useCollaborativeStore } from "@/store";
import { CollaborativeUser } from "@/store/slices";
interface CursorPointerProps {
  client: CollaborativeUser;
}

const CursorPointer = ({ client }: CursorPointerProps) => {
  const viewport = useViewport();

  const finalX = (client?.cursor?.x || 0) * viewport.zoom + viewport.x;
  const finalY = (client?.cursor?.y || 0) * viewport.zoom + viewport.y;

  return (
    <div className="absolute pointer-events-none z-[999999]" data-thumbnail="hidden">
      <p style={{ left: `${finalX + 10}px`, top: `${finalY - 40}px` }} className={`absolute text-xs text-white px-2 py-1 rounded`}>
        {client?.userName}
      </p>
      <MousePointer2Icon
        color={client?.color || "#ffffff"}
        strokeWidth={1.5}
        fill={client?.color || "#ffffff"}
        style={{
          left: `${finalX}px`,
          top: `${finalY - 10}px`,
          transform: "translate(-2px, -2px)", // Offset to position cursor tip correctly
        }}
        className={`absolute`}
      />
    </div>
  );
};

const LiveCursor = () => {
  const collaborativeUsers = useCollaborativeStore((state) => {
    return state.collaborativeUsers;
  });

  return (
    <>
      {collaborativeUsers?.map((client, id) => {
        if (client.clientId === hocusPocusServiceSingleton?.getCurrentClientId()) return null;

        return <CursorPointer key={`cursor-${client.userId}-${id}`} client={client} />;
      })}
    </>
  );
};
export default LiveCursor;
