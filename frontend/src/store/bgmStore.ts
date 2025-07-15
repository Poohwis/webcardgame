import { create } from "zustand";
import * as Tone from "tone";
import { playBGM, stopBGM, toggleMute } from "../utils/bgm";

interface BgmStore {
  muted: boolean;
  playing: boolean;
  play: () => void;
  stop: () => void;
  toggle: () => void;
}

let toneStarted = false
export const useBgmStore = create<BgmStore>((set, get) => ({
  // muted: localStorage.getItem("bgm-muted") === "true",
  muted : true,
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

  toggle: async() => {
    const current = get().muted;
     if (!toneStarted) {
      await Tone.start();
      toneStarted = true;
      console.log("Tone.js AudioContext started");
    }
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