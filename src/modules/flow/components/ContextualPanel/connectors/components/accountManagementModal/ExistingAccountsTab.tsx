import { PencilSimpleIcon } from "@phosphor-icons/react";

import useSetActiveAccount from "../../hooks/useSetActiveAccount";
import { Button } from "@/components/ui/button";
import { useGetEmailConnectorUsers } from "@/modules/flow/services/connectors/connectorService";
import { EmailConnectorUser } from "@/modules/flow/services/connectors/types";

export default function ExistingAccountsTab({
  setEditMode,
  nodeId,
}: {
  setEditMode: React.Dispatch<React.SetStateAction<EmailConnectorUser & { isEdit: boolean }>>;
  nodeId?: string;
}) {
  const { data } = useGetEmailConnectorUsers();
  const { handleActiveAccount } = useSetActiveAccount(nodeId);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center p-6">
        <h2 className="text-md font-semibold text-foreground mb-2">No accounts found</h2>
        <p className="text-sm text-muted-foreground mb-6">You haven't added any accounts yet. Add your first account to get started.</p>
      </div>
    );
  }

  return (
    <div className="px-2 py-4">
      {data?.map((user) => (
        <div
          className="flex items-center justify-between gap-2 hover:bg-secondary  h-14 rounded-none cursor-pointer"
          onClick={() => handleActiveAccount(user)}
          key={user.userId}
        >
          <div className="flex flex-col items-start gap-1 px-4">
            <h2 className="text-sm ">{user.userDisplayName}</h2>
            <p className="text-xs text-muted-foreground">{user.userEmail}</p>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode({
                isEdit: true,
                userEmail: user.userEmail,
                userName: user.userName,
                userId: user.userId,
                userDisplayName: user.userDisplayName,
              });
            }}
          >
            <PencilSimpleIcon className="size-8" />
          </Button>
        </div>
      ))}
    </div>
  );
}
