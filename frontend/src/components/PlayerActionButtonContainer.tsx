import { motion } from "motion/react";
import {
  CardAnimationMode,
  useCardAnimationStore,
} from "../store/cardAnimationStore";
import GameButton from "./GameButton";
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
  const { addToQueue } = useCardAnimationStore();
  const isCanThrowCard = order == turn && selectCardIndices.length > 0;
  const isCanCall = order == turn && lastPlayedBy.length !== 0;

  const playCardAnimation = () => {
    addToQueue([
      CardAnimationMode.FlipS,
      CardAnimationMode.PlayCard,
      CardAnimationMode.Fan,
    ]);
  };

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
      />
      <GameButton
        onClick={() => {
          playCardAnimation();
          handlePlayCardAction();
        }}
        isSending={isSending}
        disabled={!isCanThrowCard}
        title={"THROW CARD"}
        activeColor={"bg-black"}
      />
    </div>
  );
}
