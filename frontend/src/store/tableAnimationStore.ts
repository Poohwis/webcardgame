import { create } from "zustand";

export interface TableAnimationState {
  tableQueues: string[];
  tableCurrentQueue: string;
  addToTableQueue: (processes: string[]) => void;
  tableProcessNext: () => void;
  clearTableQueue: () => void;
}

export const useTableAnimationStore = create<TableAnimationState>((set) => ({
  tableQueues: [],
  tableCurrentQueue: "default",
  clearTableQueue: () => set(() => ({ tableQueues: [], tableCurrentQueue: "default" })),
  addToTableQueue: (queue) =>
    set((state) => {
      const newQueue = [...state.tableQueues, ...queue];

      if (state.tableCurrentQueue === "default") {
        return { tableQueues: newQueue, tableCurrentQueue: newQueue[0] };
      }

      return { tableQueues: newQueue };
    }),
  tableProcessNext: () =>
    set((state) => {
      const newQueue = state.tableQueues.slice(1);
      const nextMode = newQueue[0] || "default";

      return { tableQueues: newQueue, tableCurrentQueue: nextMode };
    }),
}));
