import { genId } from "@/utils/IdGenerator";

export interface GenOneState {
  isGenOneOpen: boolean;
  setIsGenOneOpen: (isGenOneOpen: boolean) => void;
  genOneLoading: boolean;
  setGenOneLoading: (genOneLoading: boolean) => void;
  sessionId: string;
  newSession: () => void;
  hasNotification: boolean;
  setHasNotification: (hasNotification: boolean) => void;
  hasOrchestration: boolean;
  setHasOrchestration: (hasOrchestration: boolean) => void;
}

export const createGenOneSlice = (set: any, _get: any): GenOneState => ({
  isGenOneOpen: false,
  setIsGenOneOpen: (isGenOneOpen: boolean) => set(() => ({ isGenOneOpen })),
  genOneLoading: false,
  setGenOneLoading: (genOneLoading: boolean) => set(() => ({ genOneLoading })),
  sessionId: genId(), 
  newSession: () => set(() => ({ sessionId: genId() })),
  hasNotification: false,
  setHasNotification: (hasNotification: boolean) => set(() => ({ hasNotification })),
  hasOrchestration: false,
  setHasOrchestration: (hasOrchestration: boolean) => set(() => ({ hasOrchestration })),
});
