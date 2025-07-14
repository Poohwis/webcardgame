import { Howl } from 'howler';
import jazz_01 from "../assets/bgm/jazz_bgm_01.webm"
import jazz_02 from "../assets/bgm/jazz_bgm_02.webm"
import jazz_03 from "../assets/bgm/jazz_bgm_03.webm"

const tracks = [
  new Howl({ src: [jazz_01], volume: 0.25, html5: true }),
  new Howl({ src: [jazz_02], volume: 0.25, html5: true }),
  new Howl({ src: [jazz_03], volume: 0.35, html5: true }),
];


let currentTrackIndex = 0;
let currentHowl: Howl | null = null;

function stopCurrentTrack() {
  if (currentHowl) {
    currentHowl.off("end");
    currentHowl.stop();
    currentHowl = null;
  }
}

function playNextTrack() {
  stopCurrentTrack();

  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  currentHowl = tracks[currentTrackIndex];

  currentHowl.play();
  currentHowl.once("end", playNextTrack);
}

export function playBGM(index = 0) {
  stopCurrentTrack();

  currentTrackIndex = index;
  currentHowl = tracks[currentTrackIndex];

  currentHowl.play();
  currentHowl.once("end", playNextTrack);
}

export function stopBGM() {
  stopCurrentTrack();
}

export function toggleMute() {
  const next = !tracks[0].mute(); // assume all share same mute state
  tracks.forEach(track => track.mute(next));
  localStorage.setItem("bgm-muted", next.toString());
}

export function switchBGM() {
  const nextIndex = (currentTrackIndex + 1) % tracks.length;
  playBGM(nextIndex);
}