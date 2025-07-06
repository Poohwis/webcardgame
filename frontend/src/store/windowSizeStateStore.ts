import { create } from "zustand";

export interface WindowSizeState {
  windowWidth: number;
  windowHeight: number;
  isSmallWindow: boolean;
  cardContainerPosition: number;
  setCardContainerPosition: (positionTopY: number) => void;
  setIsSmallWindow: (bool: boolean) => void;
  setWindowWidth: (width: number) => void;
  setWindowHeight: (height: number) => void;
}

export const useWindowSizeStore = create<WindowSizeState>((set) => ({
  windowWidth: 0,
  windowHeight: 0,
  isSmallWindow: false,
  cardContainerPosition: 0,
  setCardContainerPosition: (positionTopY) =>
    set(() => ({ cardContainerPosition: positionTopY })),
  setIsSmallWindow: (bool: boolean) => set(() => ({ isSmallWindow: bool })),
  setWindowWidth: (width: number) => set(() => ({ windowWidth: width })),
  setWindowHeight: (height: number) => set(() => ({ windowHeight: height })),
}));
