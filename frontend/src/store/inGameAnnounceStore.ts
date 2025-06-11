import { create } from "zustand";

export enum InGameAnnounceType {
  CardSelectExceed = "cardSelectExceed",
  CardNotSelect = "cardNotSelect",
  NoCallAllowed = "noCallAllowed",
  ForceThrowAll = "forceThrowAll",
}

export const InGameAnnounceMessages: Record<InGameAnnounceType, string> = {
  [InGameAnnounceType.CardSelectExceed]: "You can only select up to 3 cards",
  [InGameAnnounceType.CardNotSelect]: "Please select at least one card",
  [InGameAnnounceType.NoCallAllowed]: "You cannot call at this turn",
  [InGameAnnounceType.ForceThrowAll]: "You must call or throw all your cards this turn",
};

interface InGameAnnounceState {
  announceState: InGameAnnounceType | null;
  setAnnounce: (type: InGameAnnounceType) => void;
  resetAnnounce: () => void;
}
export const useInGameAnnounceStore = create<InGameAnnounceState>((set) => ({
  announceState: null,
  setAnnounce: (type) => set(() => ({ announceState: type })),
  resetAnnounce: () => set(() => ({ announceState: null })),
}));
