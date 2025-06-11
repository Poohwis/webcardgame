import { create } from "zustand";

export type RingMode = "initial" | "start" | "boardSetupTwo";
export type PointerMode = "initial" | "pointing";
export type TableState =
  | "initial"
  | "boardSetupOne"
  | "boardSetupTwo"
  | "start"
  | "turn"
  | "callSuccess"
  | "callFail"
  | "resultUpdate"
  | "nextRound"
  | "nextGame";

export interface tableState {
  tableState: TableState;
  pointerState: PointerMode;
  ringState: RingMode;
  setTableState: (type: TableState) => void;
  setPointerState: (type: PointerMode) => void;
  setRingState: (type: RingMode) => void;
  resetTableState: () => void;
  resetPointerAndRingState: () => void;
}

export const useTableStateStore = create<tableState>((set) => ({
  tableState: "initial",
  pointerState: "initial",
  ringState: "initial",
  setTableState: (type) => set(() => ({ tableState: type })),
  setPointerState: (type) => set(() => ({ pointerState: type })),
  setRingState: (type) => set(() => ({ ringState: type })),
  resetTableState: () => set(() => ({ tableState: "initial" })),
  resetPointerAndRingState: () =>
    set(() => ({ ringState: "initial", pointerState: "initial" })),
}));
