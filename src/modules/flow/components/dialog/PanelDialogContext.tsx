import { createDialogContext } from "./createDialogContext";

const {
  useDialogContext: usePanelDialogContext,
  useDialogStateContext: usePanelDialogStateContext,
  DialogProvider: PanelDialogProvider,
} = createDialogContext("Panel");

export { usePanelDialogContext, usePanelDialogStateContext, PanelDialogProvider };
