import React from "react";

import AddAccountTab from "./AddAccountTab";
import EditAccountTab from "./EditAccount";
import ExistingAccountsTab from "./ExistingAccountsTab";
import { EditModeState } from "../../types";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils";

interface AccountManagmentModal {
  id: string;
  onClose: () => void;
  editMode?: EditModeState;
  nodeId?: string;
}

export default function AccountManagementModal({ onClose, editMode, nodeId }: AccountManagmentModal) {
  const [editModeState, setEditModeState] = React.useState<EditModeState>(editMode!);
  const [activeTab, setActiveTab] = React.useState(editModeState ? "existingAccount" : "addAccount");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-[416px] border-border block bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto translate-x-0 translate-y-0 origin-center top-[14px] right-[427px]",
          "data-[state=closed]:!slide-out-to-right-full data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-right-full data-[state=open]:!slide-in-from-top-0 data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=open]:!animate-z-index-slide-in data-[state=closed]:z-[5] !duration-200 px-0 py-0"
        )}
        overlayProps={{ className: "bg-transparent pointer-events-none" }}
      >
        <DialogHeader className="border-b border-border p-0">
          <DialogDescription className="sr-only">Contextual Panel Dialog</DialogDescription>
          <h3 className="text-sm text-card-foreground p-4">Account management</h3>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="">
          <TabsList className="bg-inherit w-full border-b border-border rounded-none flex items-center px-4 pt-3 pb-0 justify-start h-full">
            <TabsTrigger
              value="addAccount"
              className=" border-b border-b-transparent data-[state=active]:border-b data-[state=active]:border-white !bg-transparent rounded-none pt-2 pb-3"
            >
              Add new account
            </TabsTrigger>
            <TabsTrigger
              value="existingAccount"
              className="border-b border-b-transparent data-[state=active]:border-b data-[state=active]:border-white !bg-transparent rounded-none pt-2 pb-3"
            >
              Existing account
            </TabsTrigger>
          </TabsList>
          <TabsContent value="addAccount" className="pt-4 mt-0">
            <AddAccountTab />
          </TabsContent>
          <TabsContent value="existingAccount" className="mt-0">
            {editModeState?.isEdit ? (
              <EditAccountTab setEditMode={setEditModeState!} editMode={editModeState} />
            ) : (
              <ExistingAccountsTab setEditMode={setEditModeState!} nodeId={nodeId} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
