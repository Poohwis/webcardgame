import { create } from "zustand";
import { playBGM, stopBGM, toggleMute } from "../utils/bgm";

interface BgmStore {
  muted: boolean;
  playing: boolean;
  play: () => void;
  stop: () => void;
  toggle: () => void;
}

export const useBgmStore = create<BgmStore>((set, get) => ({
  muted: localStorage.getItem("bgm-muted") === "true",
  playing: false,

  play: () => {
    if (get().muted) return;
    if (!get().playing) {
      playBGM();
      set({ playing: true });
    }
  },

  stop: () => {
    stopBGM();
    set({ playing: false });
  },

  toggle: () => {
    const current = get().muted;
    toggleMute();
    localStorage.setItem("bgm-muted", (!current).toString());
    set({ muted: !current });
    if (current) {
      get().play(); // unmuted, start BGM
    } else {
      get().stop(); // muted, stop BGM
    }
  },
}));