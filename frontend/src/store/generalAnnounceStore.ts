import { create } from "zustand";

export enum GeneralAnnounceType {
  RejectNameChange = "RejectNameChange",
  SuccessNameChange = "SuccessNameChange"
}

export const GeneralAnnounceMessage: Record<GeneralAnnounceType, string> = {
  [GeneralAnnounceType.RejectNameChange]: "Name already in use",
  [GeneralAnnounceType.SuccessNameChange]: "Name change successfull",
};

export interface GeneralAnnounceState {
  generalAnnounceState: GeneralAnnounceType | null;
  setGeneralAnnounce: (type: GeneralAnnounceType) => void;
  resetGeneralAnnounce: () => void;
}
export const useGeneralAnnounceStore = create<GeneralAnnounceState>((set) => ({
  generalAnnounceState: null,
  setGeneralAnnounce: (type) => set(() => ({ generalAnnounceState: type })),
  resetGeneralAnnounce: () => set(() => ({ generalAnnounceState: null })),
}));
