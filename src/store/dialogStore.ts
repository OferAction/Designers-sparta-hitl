import { ReactNode } from "react";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { genId } from "@/utils";

type DialogContentProps = { id: string; onClose: () => void };
type DialogContentFn = (props: DialogContentProps) => ReactNode;

export interface DialogInstance {
  id: string;
  content: DialogContentFn;
}

interface DialogStoreState {
  dialogs: DialogInstance[];
  openDialog: (content: DialogContentFn) => string;
  closeDialog: (id?: string) => void;
}

export const useDialogStore = create<DialogStoreState>()(
  devtools(
    (set) => ({
      dialogs: [],
      openDialog: (content) => {
        const id = genId();
        set((state) => ({
          dialogs: [...state.dialogs, { id, content }],
        }));
        return id;
      },
      closeDialog: (id) =>
        set((state) => ({
          dialogs: id ? state.dialogs.filter((dlg) => dlg.id !== id) : state.dialogs.slice(0, -1), // close last if no id
        })),
    }),
    { enabled: import.meta.env.DEV, name: "DialogStore" }
  )
);

const selector = (state: DialogStoreState) => ({
  openDialog: state.openDialog,
  closeDialog: state.closeDialog,
});

export const useDialogStoreActions = () => {
  return useDialogStore(useShallow(selector));
};
