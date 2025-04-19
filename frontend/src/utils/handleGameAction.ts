import {
  CardAnimationMode,
  CardAnimationState,
} from "../store/cardAnimationStore";
import { GameState } from "../store/gameStateStore";
import { GameMessage } from "../type";

export default async function handleGameAction(
  payload: GameMessage["payload"],
  gameStateStore: GameState,
  cardAnimationStore: CardAnimationState
) {
  const { updateGameState } = gameStateStore;
  const { addToQueue } = cardAnimationStore;

  //for now bulk update the clientState for easy implement; TODO: update only the updated state
  switch (payload.action) {
    case "start":
      updateGameState(payload);
      break;
    case "playCard":
      updateGameState(payload);
      break;
    case "call":
      updateGameState(payload);
      break;
    case "nextRound":
      updateGameState(payload);
      break;
    case "nextGame":
      updateGameState(payload);
      break;
    case "wait":
      updateGameState(payload);
      break;
    case "toNextRound":
      updateGameState(payload);
      break;
    case "toNextGame":
      updateGameState(payload)
      break;
    default:
    //   console.warn("Unhandled action type:", payload.action);
  }
}
