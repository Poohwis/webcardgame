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
  Reset = "reset",
  Ready = "ready",
  Wait = "wait",
  FlipS = "flips",
  SelectableOn = "selectableOn",
  SelectableOff = "selectableOff",
  ClickableOn = "clickableOn",
  ClickableOff = "clickableOff",
}

export interface CardAnimationState {
  queue: CardAnimationMode[];
  currentMode: CardAnimationMode;
  addToQueue: (modes: CardAnimationMode[]) => void;
  processNext: () => void;
  dealCardAnimation: () => void;
  playCardAnimation: () => void;
  returnCardAnimation: () => void;
  resetCardAnimation : ()=> void
  clearQueue: () => void;
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
  clearQueue: () => set(() => ({ queue: [], currentMode : CardAnimationMode.Ready })),
  dealCardAnimation: () =>
    set((state) => {
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
    }),
  playCardAnimation: () =>
    set((state) => {
      state.addToQueue([
        CardAnimationMode.FlipS,
        CardAnimationMode.PlayCard,
        CardAnimationMode.Fan,
      ]);
      return {};
    }),
  returnCardAnimation: () =>
    set((state) => {
      state.addToQueue([
        CardAnimationMode.ClickableOff,
        CardAnimationMode.SelectableOff,
        CardAnimationMode.FlipToBack,
        CardAnimationMode.Fold,
        CardAnimationMode.Up,
      ]);
      return {};
    }),
    resetCardAnimation : ()=>
       set((state) => {
        state.addToQueue([CardAnimationMode.Reset])
        return {}
       })
}));
