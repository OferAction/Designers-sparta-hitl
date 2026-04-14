import { useMemo, useState } from "react";

import { PlusIcon, UserCircleIcon } from "@phosphor-icons/react";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import AccountManagmentModal from "./accountManagementModal";
import usePopupAuthListener from "../hooks/usePopupAuthListener";
import useSetActiveAccount from "../hooks/useSetActiveAccount";
import { InputLabel } from "@/components/common/InputLabel";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { useGetEmailConnectorUsers } from "@/modules/flow/services/connectors/connectorService";
import { EmailConnectorUser } from "@/modules/flow/services/connectors/types";
import { NodeVariant } from "@/modules/flow/types";
import { useDialogStoreActions, useFlowStore } from "@/store";

function ConnectAccount({ nodeId }: { nodeId?: string }) {
  const { data } = useGetEmailConnectorUsers();
  const { openDialog } = useDialogStoreActions();
  const nodes = useFlowStore((state) => state.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const { handleActiveAccount } = useSetActiveAccount(selectedNode?.id ?? nodeId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeUser = useMemo(() => {
    const userIdInput = selectedNode?.data.inputs.find((input) => input.key === "userId");

    const user = data?.find((u) => u.userId === userIdInput?.value.value || u.userEmail === userIdInput?.value.label);

    return user ? user.userDisplayName || user.userName : userIdInput?.value.label;
  }, [selectedNode?.data.inputs, data]);

  usePopupAuthListener();

  function handleDialog() {
    setIsDropdownOpen(false);
    openDialog(({ id, onClose }) => <AccountManagmentModal id={id} onClose={onClose} nodeId={selectedNode?.id ?? nodeId} />);
  }

  function handleUserSelect(user: EmailConnectorUser) {
    handleActiveAccount(user);
    setIsDropdownOpen(false);
  }

  function handleEditUser(e: React.MouseEvent, user: EmailConnectorUser) {
    e.stopPropagation();
    setIsDropdownOpen(false);
    openDialog(({ id, onClose }) => (
      <AccountManagmentModal
        id={id}
        onClose={onClose}
        nodeId={selectedNode?.id ?? nodeId}
        editMode={{
          isEdit: true,
          userEmail: user.userEmail,
          userName: user.userName,
          userId: user.userId,
          userDisplayName: user.userDisplayName,
        }}
      />
    ));
  }

  return (
    <SectionContainer>
      <SectionTitle title="Account" />
      {activeUser ? (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <InputLabel variant="active" className="text-white" icon={<UserCircleIcon weight="fill" />}>
              {activeUser}
            </InputLabel>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[296PX] px-0" align="start">
            <div className="py-2">
              {data && data.length > 0 ? (
                data.map((user) => {
                  return (
                    <DropdownMenuItem
                      key={user.userId}
                      className="flex items-center justify-between gap-2 hover:bg-secondary  h-14 rounded-none px-2"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex flex-col items-start gap-1 px-4">
                        <h2 className="text-sm ">{user.userDisplayName || user.userName}</h2>
                        <p className="text-xs text-muted-foreground">{user.userEmail}</p>
                      </div>
                      <Button variant="link" size="sm" onClick={(e) => handleEditUser(e, user)}>
                        <PencilSimpleIcon className="size-8" />
                      </Button>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No accounts found</p>
                  <p className="text-xs text-muted-foreground">Add your first account to get started</p>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <div className="flex items-center justify-center gap-1 py-2 cursor-pointer" onClick={handleDialog}>
                <Button variant="ghost" className="p-0">
                  <PlusIcon />
                </Button>
                <h2 className="text-sm text-primary">Add new Account</h2>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <InputLabel variant="active" icon={<UserCircleIcon weight="fill" />} onClick={handleDialog} className="cursor-pointer">
          Connect Account
        </InputLabel>
      )}
    </SectionContainer>
  );
}

export default ConnectAccount;
