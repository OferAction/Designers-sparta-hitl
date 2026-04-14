import React from "react";

import { CaretLeftIcon } from "@phosphor-icons/react";

import useSetActiveAccount from "../../hooks/useSetActiveAccount";
import MicrosoftLogo from "@/assets/Microsoft.svg";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSelectedNode } from "@/modules/flow/hooks";
import { useDeleteEmailConnectorUser, useMicrosoftAuthorize, useAddUserDisplay } from "@/modules/flow/services/connectors/connectorService";
import { EmailConnectorUser } from "@/modules/flow/services/connectors/types";
import { NodeVariant, outlookUserIdInput } from "@/modules/flow/types";
import { useDialogStore, useFlowStore } from "@/store";

export default function EditAccountTab({
  setEditMode,
  editMode,
}: {
  setEditMode: React.Dispatch<React.SetStateAction<EmailConnectorUser & { isEdit: boolean }>>;
  editMode: EmailConnectorUser & { isEdit: boolean };
}) {
  const { handleActiveAccount } = useSetActiveAccount();
  const [connectBy, setConnectBy] = React.useState("OAuth");
  const [accountName, setAccountName] = React.useState(editMode.userDisplayName || "");
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const { mutate } = useMicrosoftAuthorize(closeDialog, accountName);
  const { mutate: deleteAccount } = useDeleteEmailConnectorUser(editMode.userId);
  const selectedNode = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const onChange = useFlowStore((state) => state.onChange);

  const displayName = accountName.trim() || editMode.userName;
  const { mutate: updateUserDisplay } = useAddUserDisplay();

  function handleSave() {
    updateUserDisplay({
      $userId: editMode.userId,
      $userDisplay: displayName,
    });
    handleActiveAccount({ ...editMode, userDisplayName: displayName });
    closeDialog();
  }

  function handleDeleteAccount() {
    deleteAccount();
    setEditMode({ isEdit: false, userEmail: "", userName: "", userId: "" });
    if (selectedNode?.id) {
      const current = Array.isArray(selectedNode.data.inputs) ? selectedNode.data.inputs : [];
      const currentUserIdInput = current.find((it) => it.key === "userId") as outlookUserIdInput;
      const currentUserId = currentUserIdInput?.value.value;

      if (currentUserId === editMode.userId) {
        const newInputs = current.map((it) => (it.key === "userId" ? { ...it, value: { label: "", value: "" } } : it));
        onChange(selectedNode.id, "inputs", newInputs);
      }
    }
  }

  return (
    <>
      <div className="flex items-center pt-4">
        <Button
          variant="link"
          size="icon"
          className=""
          onClick={() => {
            setEditMode({ isEdit: false, userEmail: "", userName: "", userId: "" });
          }}
        >
          <CaretLeftIcon />
        </Button>
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-sm">{editMode.userDisplayName} </h2>
          <p className="text-xs text-muted-foreground">{editMode.userEmail}</p>
        </div>
      </div>

      <div className="space-y-6 py-4">
        <div className="space-y-2 px-4">
          <Label>Account name</Label>
          <Input className="bg-background" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <p className="text-sm text-muted-foreground">Choose a distinctive name to easily identify this account later in the connector lists</p>
        </div>
        <div className="space-y-4 px-4">
          <Label>Connect via</Label>
          <RadioGroup defaultValue="OAuth" className="flex items-center gap-6" onValueChange={setConnectBy}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="OAuth" id="r1" disabled />
              <Label htmlFor="r1">OAuth</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="SMTP" id="r2" />
              <Label htmlFor="r2">SMTP/IMAP</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-4 px-4 pb-4">
          <div>
            <h4 className="text-sm text-foreground">Account definitions</h4>
          </div>
          {connectBy === "OAuth" && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-foreground">Reconnect with</p>
              <div className="bg-primary flex items-center justify-center gap-2 w-fit px-3 py-2 rounded-md cursor-pointer" onClick={() => mutate()}>
                <img src={MicrosoftLogo} alt="microsoft logo" />
                <p className="text-sm text-primary-foreground">Sign in with Microsoft</p>
              </div>
            </div>
          )}
          {connectBy === "SMTP" && (
            <>
              <div className="space-y-2">
                <Label>User name</Label>
                <Input className="bg-background" placeholder="Enter your account" />
              </div>
              <div className="space-y-2">
                <Label>IMAP Host</Label>
                <Input className="bg-background" placeholder="Ex: imap.example.com" />
              </div>
            </>
          )}
        </div>
      </div>
      <DialogFooter>
        <div className="flex w-full justify-between border-t border-border p-4">
          <Button
            type="button"
            variant="destructive"
            className="h-10 text-destructive bg-destructive/10 hover:bg-destructive/20"
            onClick={handleDeleteAccount}
          >
            Delete account
          </Button>
          <Button type="button" variant="secondary" className="h-10" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
