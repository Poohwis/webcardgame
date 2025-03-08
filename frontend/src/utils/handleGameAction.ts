import { GameState } from "../store/gameStateStore";
import { GameMessage } from "../type";

export default function handleGameAction(
  payload: GameMessage["payload"],
  gameStateStore: GameState
) {
  const { updateGameState } = gameStateStore;
  //for now bulk update the clientState for easy implement; TODO: update only the updated state
  switch (payload.action) {
    case "start":
      updateGameState(payload);
      break;
    case "playCard":
      updateGameState(payload);
      break;
    case "call":
      updateGameState(payload)
      break
    case "nextRound":
      updateGameState(payload)
      break
    case "nextGame":
      updateGameState(payload)
      break
    case "wait":
      updateGameState(payload)
      break
    default:
    //   console.warn("Unhandled action type:", payload.action);
  }
}
