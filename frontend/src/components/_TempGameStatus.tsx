import { useState } from "react";
import { useGameStateStore } from "../store/gameStateStore";
import { useTableStateStore } from "../store/tableStateStore";
import { sendStartMessageToServer } from "../utils/sendToServerGameMessage";
import { CLIENT_LINK } from "../link";

interface TempGameStatusProps {
  state: any;
  isSending: boolean;
  selectCardIndices: number[];
  wsId: string | undefined;
}

export default function TempGameStatus({
  state,
  isSending,
  selectCardIndices,
  wsId,
}: TempGameStatusProps) {
  const gameStateStore = useGameStateStore();
  const { tableState } = useTableStateStore();
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  const [show, setShow] = useState(true);
  return (
    <div className="absolute right-2 sm:top-0 top-10 flex flex-col">
      <div className="flex flex-col">
        <button
          className="text-sm absolute top-0 right-0 font-nippo"
          onClick={() => setShow(!show)}
        >
          {show ? "hide" : "show"}
        </button>
        <button
          className="text-sm absolute top-4 right-0 font-nippo"
          onClick={() => sendStartMessageToServer(state.ws, 1)}
        >
          start
        </button>
      </div>
      <div
        className={`mt-10 w-[160px] text-sm font-nippo ${
          show ? "visible" : "hidden"
        }`}
      >
        <div>playerOrder : {state.order}</div>
        <div>gameState: {gameStateStore.currentState}</div>
        <div className="whitespace-pre">{`tableState:\n${tableState}`}</div>
        <div>turn: {gameStateStore.turn}</div>
        <div>gameNumber: {gameStateStore.gameNumber}</div>
        <div>round: {gameStateStore.round}</div>
        <div>endGameScore: {gameStateStore.endGameScore}</div>
        <div>
          roundPlayCard: {gameStateStore.roundPlayCard}
          {cardsName[gameStateStore.roundPlayCard]}
        </div>
        <div>isOver: {gameStateStore.isOver.toString()}</div>
        <div>playersChance: {gameStateStore.playersChance}</div>
        <div>playersHandCount: {gameStateStore.playersHandCount}</div>
        <div>playersScore: {gameStateStore.playersScore}</div>
        <div>lastPlayedBy: {gameStateStore.lastPlayedBy.slice(-1)}</div>
        <div>lastPlayedCardCount: {gameStateStore.lastPlayedCardCount}</div>
        <div>cards: {gameStateStore.cards}</div>
        <div>selected : {selectCardIndices}</div>
        <div>calledCards: {gameStateStore.calledCards}</div>
        <div>isCallSuccess: {gameStateStore.isCallSuccess.toString()}</div>
        <div>forcePlayerOrder: {gameStateStore.forcePlayerOrder}</div>
        <div>lastGameStarterOrder: {gameStateStore.lastGameStarterOrder}</div>
        <div>lastRoundStarterOrder: {gameStateStore.lastRoundStarterOrder}</div>
        <div>gameResult: {gameStateStore.gameResult}</div>
        <div>isSending: {isSending.toString()}</div>
        <div>error: {state.errorMessage}</div>
        <div className="flex flex-col">
          <a 
          href={CLIENT_LINK} className="border border-black px-2">
            home
          </a>
          <a
            href={`${CLIENT_LINK}room/${wsId}`}
            rel="noopener noreferrer"
            target="_blank"
            className="border border-black px-1"
          >
            NewInstant
          </a>
          <button
            className="border border-black px-1"
            onClick={() => sendStartMessageToServer(state.ws, 1)}
          >
            Start
          </button>


          <div>
            users:
            {state.users.map((user: any) => (
              <div key={user.displayName}>
                {user.order}:{user.displayName}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
