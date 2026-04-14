import React from "react";

import { useDialogStore, useDialogStoreActions } from "@/store";

export const DialogRoot: React.FC = () => {
  const dialogs = useDialogStore((state) => state.dialogs);
  const { closeDialog } = useDialogStoreActions();

  return (
    <>
      {dialogs.map(({ id, content }) => (
        <React.Fragment key={id}>{content({ id, onClose: () => closeDialog(id) })}</React.Fragment>
      ))}
    </>
  );
};
