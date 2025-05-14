import { create } from "zustand";

export enum AnnounceType {
  CardSelectExceed = "cardSelectExceed",
  CardNotSelect = "cardNotSelect",
  NoCallAllowed = "noCallAllowed",
  ForceThrowAll = "forceThrowAll",
}

export const AnnounceMessages: Record<AnnounceType, string> = {
  [AnnounceType.CardSelectExceed]: "You can only select up to 3 cards",
  [AnnounceType.CardNotSelect]: "Please select at least one card",
  [AnnounceType.NoCallAllowed]: "You cannot call at this turn",
  [AnnounceType.ForceThrowAll]: "You must call or throw all your cards this turn",
};

interface AnnounceState {
  announceState: AnnounceType | null;
  setAnnounce: (type: AnnounceType) => void;
  resetAnnounce: () => void;
}
export const useAnnounceStore = create<AnnounceState>((set) => ({
  announceState: null,
  setAnnounce: (type) => set(() => ({ announceState: type })),
  resetAnnounce: () => set(() => ({ announceState: null })),
}));
