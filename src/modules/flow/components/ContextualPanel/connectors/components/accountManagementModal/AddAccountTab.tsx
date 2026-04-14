import React from "react";

import MicrosoftLogo from "@/assets/Microsoft.svg";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMicrosoftAuthorize } from "@/modules/flow/services/connectors/connectorService";
import { useDialogStore } from "@/store";

export default function AddAccountTab() {
  const [connectBy, setConnectBy] = React.useState("OAuth");
  const accountNameRef = React.useRef("");
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const { mutate } = useMicrosoftAuthorize(closeDialog, accountNameRef.current);
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2 px-4">
          <Label>Account name</Label>
          <Input
            className="bg-background"
            placeholder="Enter Account Name"
            defaultValue={accountNameRef.current}
            onChange={(e) => (accountNameRef.current = e.target.value)}
          />
          <p className="text-sm text-muted-foreground">Choose a distinctive name to easily identify this account later in the connector lists</p>
        </div>
        <div className="space-y-4 px-4">
          <Label>Connect via</Label>
          <RadioGroup defaultValue="OAuth" className="flex items-center gap-6" onValueChange={setConnectBy}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="OAuth" id="r1" />
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
            <div className="bg-primary flex items-center justify-center gap-2 w-fit px-3 py-2 rounded-md cursor-pointer" onClick={() => mutate()}>
              <img src={MicrosoftLogo} alt="microsoft logo" />
              <p className="text-sm text-primary-foreground">Sign in with Microsoft</p>
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
              <DialogFooter className="flex justify-between px-4 border-t border-border p-4">
                <Button type="button" variant="outline" className="h-10">
                  Reset
                </Button>
                <Button type="button" variant="default" className="h-10">
                  Connect
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </div>
    </>
  );
}
