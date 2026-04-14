import { createDialogContext } from "./createDialogContext";

const {
  useDialogContext: useCanvasDialogContext,
  useDialogStateContext: useCanvasDialogStateContext,
  DialogProvider: CanvasDialogProvider,
} = createDialogContext("Canvas");

export { useCanvasDialogContext, useCanvasDialogStateContext, CanvasDialogProvider };
