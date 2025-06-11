import { create } from "zustand";

export interface WindowSizeState {
  windowWidth: number;
  isSmallWindow: boolean;
  cardContainerPosition: number;
  setCardContainerPosition: (positionTopY: number) => void;
  setIsSmallWindow: (bool: boolean) => void;
  setWindowWidth: (width: number) => void;
}

export const useWindowSizeStore = create<WindowSizeState>((set) => ({
  windowWidth: 0,
  isSmallWindow: false,
  cardContainerPosition: 0,
  setCardContainerPosition: (positionTopY) =>
    set(() => ({ cardContainerPosition: positionTopY })),
  setIsSmallWindow: (bool) => set(() => ({ isSmallWindow: bool })),
  setWindowWidth: (width) => set(() => ({ windowWidth: width })),
}));
