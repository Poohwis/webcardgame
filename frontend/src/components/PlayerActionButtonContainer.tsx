import {
  useCardAnimationStore,
} from "../store/cardAnimationStore";
import GameButton from "./GameButton";
import { useGameStateStore } from "../store/gameStateStore";
interface PlayerActionContainerProps {
  handleCallAction: () => void;
  handlePlayCardAction: () => void;
  turn: number;
  order: number;
  isSending: boolean;
  lastPlayedBy: number[];
  selectCardIndices: number[];
}
export default function PlayerActionContainer({
  handleCallAction,
  handlePlayCardAction,
  turn,
  order,
  isSending,
  lastPlayedBy,
  selectCardIndices,
}: PlayerActionContainerProps) {
  const { playCardAnimation } = useCardAnimationStore();
  const {forcePlayerOrder} =useGameStateStore()
  const isCanThrowCard = order == turn && selectCardIndices.length > 0;
  const isCanCall = order == turn && lastPlayedBy.length !== 0;
  const isForceThrowAll = order === turn && order === forcePlayerOrder

  return (
    <div className="flex flex-row gap-x-4 ">
      <GameButton
        onClick={() => {
          handleCallAction()
        }}
        isSending={isSending}
        disabled={!isCanCall}
        title={"CALL LIAR!"}
        activeColor={"bg-deepred"}
        type="call"
        turn ={turn}
        order={order}
        showDelaySecond={0.2}
      />
      <GameButton
        onClick={() => {
          playCardAnimation();
          handlePlayCardAction();
        }}
        isSending={isSending}
        disabled={isForceThrowAll ? false : !isCanThrowCard}
        title={isForceThrowAll ? "THROW ALL" : "THROW CARD"}
        activeColor={"bg-lime-500"}
        type="throw"
        turn={turn}
        order={order}
        showDelaySecond={0.4}
      />
    </div>
  );
}
