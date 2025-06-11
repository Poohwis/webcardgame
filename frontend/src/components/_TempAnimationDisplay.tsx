import { useState } from "react";
import { useCardAnimationStore } from "../store/cardAnimationStore";
import { useTableAnimationStore } from "../store/tableAnimationStore";
import { useTableStateStore } from "../store/tableStateStore";

export default function TempAnimationDisplay() {
  const { ringState, pointerState } = useTableStateStore();
  const { queue, currentMode, clearQueue, returnCardAnimation } =
    useCardAnimationStore();
  const { tableQueues, tableCurrentQueue, clearTableQueue } =
    useTableAnimationStore();
  const [show, setShow] = useState(true);
  return (
    <div className="fixed left-2 text-sm font-nippo top-0">
      <button onClick={() => setShow(!show)}>{show ? "hide" : "show"}</button>
      <div style={{visibility : show ? "visible" : "hidden"}}>
        <div>ringState: {ringState}</div>
        <div>pointerState: {pointerState}</div>
        <div className="mt-4">
          cardQueue:
          <br />
          <div className="flex flex-row gap-x-1">
            {"->"}
            {queue.map((q, index) => (
              <div
                key={index}
                className="bg-black text-white px-1 rounded-full"
              >
                {q}
              </div>
            ))}
          </div>
        </div>
        <div>
          currentQueue:{" "}
          <span className="bg-red-500 text-white px-1 rounded-full">
            {currentMode}
          </span>
        </div>
        <button onClick={clearQueue}>reset</button>
        <button onClick={returnCardAnimation} className="ml-2">
          return
        </button>

        <div className="mt-4">
          tableQueue:
          <br />
          <div className="flex flex-row gap-x-1">
            {"->"}
            {tableQueues.map((q, index) => (
              <div
                key={index}
                className="bg-black text-white px-1 rounded-full"
              >
                {q}
              </div>
            ))}
          </div>
        </div>
        <div>
          tableCurrentQueue:{" "}
          <span className="bg-cyan-500 text-white px-1 rounded-full">
            {tableCurrentQueue}
          </span>
        </div>
        <button onClick={clearTableQueue}>resetT</button>
      </div>
    </div>
  );
}
