import { create } from "zustand";

export enum CardAnimationMode {
  Standby = "standby",
  Fan = "fan",
  PlayCard = "playcard",
  Fold = "fold",
  FlipToBack = "flipback",
  FlipToFront = "flipfront",
  Fall = "fall",
  Up = "up",
  Ready = "ready",
  Wait = "wait",
  FlipS = "flips",
  SelectableOn = "selectableOn",
  SelectableOff = "selectableOff",
}

export interface CardAnimationState {
  queue: CardAnimationMode[];
  currentMode: CardAnimationMode;
  addToQueue: (modes: CardAnimationMode[]) => void;
  processNext: () => void;
  dealCardAnimation: ()=>void
}

export const useCardAnimationStore = create<CardAnimationState>((set) => ({
  queue: [],
  currentMode: CardAnimationMode.Ready,
  addToQueue: (modes) =>
    set((state) => {
      const newQueue = [...state.queue, ...modes];

      if (state.currentMode === CardAnimationMode.Ready) {
        return { queue: newQueue, currentMode: newQueue[0] };
      }

      return { queue: newQueue };
    }),
  processNext: () =>
    set((state) => {
      const newQueue = state.queue.slice(1);
      const nextMode = newQueue[0] || CardAnimationMode.Ready;

      return { queue: newQueue, currentMode: nextMode };
    }),
    dealCardAnimation : ()=> set((state) => {
      state.addToQueue([
        CardAnimationMode.SelectableOff,
        CardAnimationMode.FlipToBack,
        CardAnimationMode.Fold,
        CardAnimationMode.Fall,
        CardAnimationMode.Fan,
        CardAnimationMode.FlipToFront,
        CardAnimationMode.SelectableOn,
      ]);
      return {};
    })
}));
