import * as Tone from "tone";
import deal from "../assets/sound/flip01.wav";
import flip from "../assets/sound/flip02.wav";
import slap from "../assets/sound/slap.wav";
import scatter from "../assets/sound/scatter.wav";
import coin_bling from "../assets/sound/coin_bling (1).mp3";
export interface PlaySoundOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  echo? : {delayTime : number, feedback : number}
}

/**
 * Play sound immediately. Disposes nodes after playback.
 */
export async function PlayOnce(url: string, options: PlaySoundOptions = {}) {
  await Tone.start();

  const {
    rate = 1,
    pitch = 0,
    volume = 0,
    echo = false, // new echo option
  } = options;

  const volumeNode = new Tone.Volume(volume).toDestination();
  const pitchNode = new Tone.PitchShift({ pitch });

  // Setup echo node if enabled
  let echoNode: Tone.FeedbackDelay | null = null;

  if (echo) {
    const echoOptions =
      typeof echo === "object"
        ? {
            delayTime: echo.delayTime ?? 0.25,
            feedback: echo.feedback ?? 0.4,
          }
        : {
            delayTime: 0.25,
            feedback: 0.4,
          };

    echoNode = new Tone.FeedbackDelay(echoOptions).connect(volumeNode);
    pitchNode.connect(echoNode);
  } else {
    pitchNode.connect(volumeNode);
  }

  const player = new Tone.Player({
    url,
    playbackRate: rate,
    autostart: true,
  }).connect(pitchNode);

  await Tone.loaded();

  player.onstop = () => {
    player.disconnect();
    pitchNode.disconnect();
    volumeNode.disconnect();
    echoNode?.disconnect();

    player.dispose();
    pitchNode.dispose();
    volumeNode.dispose();
    echoNode?.dispose();
  };
}

export async function PlaySomeReverse(
  url: string,
  options: PlaySoundOptions = {}
) {
  await Tone.start();

  const { rate = 1, pitch = 0, volume = 0 } = options;

  // Use ToneAudioBuffer instead of deprecated Tone.Buffer
  const audioBuffer = new Tone.ToneAudioBuffer(url);
  await audioBuffer.loaded;
  audioBuffer.reverse = true; // 🔁 reverse playback

  const volumeNode = new Tone.Volume(volume).toDestination();
  const pitchNode = new Tone.PitchShift({ pitch }).connect(volumeNode);

  const player = new Tone.Player({
    playbackRate: rate,
    autostart: true,
  }).connect(pitchNode);
  player.buffer = audioBuffer;

  player.onstop = () => {
    player.disconnect();
    pitchNode.disconnect();
    volumeNode.disconnect();

    player.dispose();
    pitchNode.dispose();
    volumeNode.dispose();
  };
}

export function PlayDealCardSound() {
  PlayOnce(deal, { pitch: Math.random() * 15 - 5, rate: 1.2 });
}

export function PlayGatherCardSound(pitch: number) {
  PlayOnce(deal, { pitch: pitch + 5, rate: 1.2 });
}

export function PlayRevealCardSound() {
  PlayOnce(flip, { pitch: Math.random() * 10 - 20 });
}

export function PlaySlapSound() {
  PlayOnce(slap, { rate: 5, pitch: -5 });
}

export function PlaySlidingCardSound() {
  PlayOnce(deal, {
    rate: 1,
    pitch: Math.random() * 5,
  });
}

export function PlayDownCardSound(order: number) {
  PlayOnce(deal, { pitch: 15 - order * 0.5 });
}

export function PlayScatterCardSound() {
  PlayOnce(scatter, { rate: 1.5 });
}

export function PlayCallCardSound(
  repeat: number,
  interval: number,
  startDelay: number
) {
  setTimeout(() => {
    for (let i = 0; i < repeat; i++) {
      setTimeout(() => {
        PlayOnce(deal, {
          pitch: Math.random() * 2 - 2,
        });
      }, i * interval);
    }
  }, startDelay);
}

export function PlaySelectCardSound() {
  PlayOnce(deal, { pitch: Math.random() * 10 - 5, rate: 1.2 });
}

export function PlayFlipSound(order: number, flipTo: "front" | "back") {
  PlayOnce(deal, { pitch: flipTo === "front" ? order : 5 - order, rate: 1.2 });
}

export function PlayCardPlayedSound() {
  PlayOnce(deal, { pitch: Math.random() * 15 - 5, rate: 0.8 });
}

export function PlayLetterHitSound(letterLength: number) {
  for (let i = 0; i <= letterLength; i++) {
    setTimeout(() => {
      PlayOnce(deal, { rate: 2, pitch : 5 + (i * 2)});
    }, 100 * i);
  }
}

export const PlayCallRippleSound = () => {
  const pitchRatios = [1.0, 1.125, 1.25];
  setTimeout(()=> {

  for (let i = 0; i <= 2; i++) {
    setTimeout(() => {
      PlayOnce(coin_bling, { pitch: pitchRatios[i], rate: 0.6, volume: -15 });
    }, i * 100);
  }
  }, 200)
};
