import { useState } from "react";
import output1 from "../assets/sound/flip01.wav";
import output2 from "../assets/sound/flip02.wav";
import florish02 from "../assets/sound/florish02.wav";
import slap from "../assets/sound/slap.wav";
import flourish from "../assets/sound/flourish.wav";
import scatter from "../assets/sound/scatter.wav";
import coin_bling from "../assets/sound/coin_bling (1).mp3";
import hit from "../assets/sound/hit.mp3"
import correct from "../assets/sound/correct.mp3"
import success from "../assets/sound/shortsuccess.mp3"
import { PlayLetterHitSound, PlayOnce, PlaySomeReverse } from "../utils/sound";

export default function TempSound() {
  const [pitch, setPitch] = useState(0); // semitones
  const [volume, setVolume] = useState(0); // dB
  const [rate, setRate] = useState(1); // playback speed

  return (
    <div className="flex flex-col absolute top-0 left-0 p-4 bg-white/80 rounded-xl shadow-md space-y-2 w-64">
      <label>
        🎚️ Pitch: {pitch} semitones
        <input
          type="range"
          min={-12}
          max={12}
          step={0.1}
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
        />
      </label>

      <label>
        🔊 Volume: {volume} dB
        <input
          type="range"
          min={-60}
          max={0}
          step={1}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </label>

      <label>
        ⏩ Rate: {rate.toFixed(2)}x
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
        />
      </label>

      <hr />

      <button onClick={() => PlayOnce(output2, { pitch, rate })}>
        {" "}
        output2
      </button>
      <button onClick={() => PlayOnce(slap, { pitch, rate })}>slap </button>
      <button onClick={() => PlayOnce(flourish, { pitch, rate })}>
        {" "}
        florish
      </button>
      <button onClick={() => PlayOnce(florish02, { pitch, rate })}>
        {" "}
        florish02
      </button>
      <button onClick={() => PlayOnce(florish02, { pitch, rate })}>
        {" "}
        florish02
      </button>
      <button onClick={() => PlayOnce(scatter, { pitch, rate })}>
        {" "}
        scatter
      </button>
      <button onClick={() => PlayOnce(coin_bling, { pitch, rate })}>
        {" "}
        coin bling
      </button>
      <button onClick={() => PlayOnce(coin_bling, { pitch, rate })}>
        {" "}
        coin bling
      </button>
      <button onClick={() => PlayOnce(hit, { pitch, rate, volume })}>
        {" "}
        hit
      </button>
      <button onClick={() => PlayOnce(correct, { pitch, rate, volume })}>
        {" "}
        correct
      </button>
      <button onClick={() => PlayOnce(success, { pitch, rate, volume })}>
        {" "}
        success
      </button>

      <button onClick={() => PlaySomeReverse(output1, { pitch, rate })}>
        reverse flip1
      </button>
      <button onClick={() => PlaySomeReverse(output2, { pitch, rate })}>
        reverse flip2
      </button>
      <button onClick={() => PlaySomeReverse(slap, { pitch, rate })}>
        reverse slap
      </button>
      <button onClick={() => PlaySomeReverse(flourish, { pitch, rate })}>
        reverse flourish
      </button>
      <button onClick={() => PlaySomeReverse(florish02, { pitch, rate })}>
        reverse florish02
      </button>
      <button onClick={() => PlaySomeReverse(scatter, { pitch, rate })}>
        reverse scatter
      </button>
      <button onClick={() => PlaySomeReverse(coin_bling, { pitch, rate })}>
        reverse coin bling
      </button>

      <button onClick={()=>PlayLetterHitSound(5)}>
      letter hit
      </button>
    </div>
  );
}
