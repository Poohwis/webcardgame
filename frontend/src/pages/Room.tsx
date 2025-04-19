import { motion } from "motion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserPanel from "../components/UserPanel";
import { Action, Chat, User } from "../type";
import ChatBox from "../components/ChatBox";
import { handleWebSocketMessage } from "../utils/wsMessageHandler";
import { sendToServer } from "../utils/sendTosServer";
import {
  sendNextGameMessageToServer,
  sendNextRoundMessageToServer,
  sendStartMessageToServer,
} from "../utils/sendToServerGameMessage";
import { useGameStateStore } from "../store/gameStateStore";
import PlayerActionContainer from "../components/PlayerActionButtonContainer";
import CardContainer from "../components/CardContainer";
import { useCardAnimationStore } from "../store/cardAnimationStore";
import wait from "../utils/wait";
import TableContainer from "../components/TableContainer";
import UserBanner from "../components/UserBanner";

const initialState = {
  ws: null as WebSocket | null,
  chatInput: "",
  chats: [] as Chat[],
  gameState: "initial",
  displayName: "",
  order: 0,
  cards: [],
  users: [] as User[],
  eventslog: [] as string[],
  error: false,
};

function reducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case "SET_WS":
      return { ...state, ws: action.payload };
    case "SET_CHAT":
      return { ...state, chatInput: action.payload };
    case "ADD_CHAT":
      return { ...state, chats: [...state.chats, action.payload] };
    case "SET_GAME":
      return { ...state, gameState: action.payload };
    case "SET_DISPLAYNAME":
      return { ...state, displayName: action.payload };
    case "SET_ORDER":
      return { ...state, order: action.payload };
    case "UPDATE_USERS":
      return { ...state, users: action.payload };
    case "ADD_EVENT":
      return { ...state, eventslog: [...state.eventslog, action.payload] };
    case "SET_ERROR":
      return { ...state, error: true };
    default:
      return state;
  }
}
export default function RoomPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSending, setIsSending] = useState(false);
  const [selectCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const { wsId } = useParams();
  const navigate = useNavigate();

  const usersRef = useRef<User[]>([]);
  const gameStateStore = useGameStateStore();
  const cardAnimationStore = useCardAnimationStore();

  useEffect(() => {
    usersRef.current = state.users;
  }, [state.users]);

  useEffect(() => {
    //TODO : change to use environment variable for ws
    gameStateStore.resetGameState();
    const ws = new WebSocket(`ws://localhost:8080/ws/${wsId}`);

    const handleMessage = (e: MessageEvent) => {
      handleWebSocketMessage(
        e,
        dispatch,
        usersRef,
        gameStateStore,
        cardAnimationStore
      );
    };

    ws.addEventListener("message", handleMessage);
    ws.addEventListener("error", () => dispatch({ type: "SET_ERROR" }));

    dispatch({ type: "SET_WS", payload: ws });

    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    };
  }, [wsId]);

  const handleChatMessageSend = () => {
    const payload = { message: state.chatInput, order: state.order };
    sendToServer(state.ws, "chat", payload);
    dispatch({ type: "SET_CHAT", payload: "" });
  };

  const handleSendNameChange = () => {
    if (state.displayName.length < 1 || state.displayName.length > 15) {
      return;
    }
    const payload = { newName: state.displayName.trim() };
    sendToServer(state.ws, "nameChange", payload);
  };

  if (state.error) {
    navigate("/notfound");
    return null;
  }

  // lines under this is temp for test TODO: DELETE
  const handleSim = () => {
    const ws = new WebSocket(`ws://localhost:8080/ws/${wsId}`);
  };
  const [show, setShow] = useState(true);
  const [action, setAction] = useState("");
  const [data, setData] = useState("");
  const [payload, setPayload] = useState({});
  useEffect(() => {
    setPayload({ action: action, data: data });
  }, [action, data]);
  //end of temp

  const handleSelectCard = (index: number) => {
    setSelectedCardIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        if (selectCardIndices.length == 3) return prev;
        return [...prev, index];
      }
    });
  };

  const handlePlayCardAction = async () => {
    if (isSending) return;
    if (gameStateStore.turn !== state.order) {
      console.log("Invalid player turn");
      return;
    }
    if (
      selectCardIndices.length < 1 &&
      gameStateStore.forcePlayerOrder !== state.order
    ) {
      console.log("Not select the card");
      return;
    }
    setIsSending(true);

    //Update client card
    let playedCards = [];
    if (gameStateStore.forcePlayerOrder !== -1) {
      const remainHand = gameStateStore.cards
        .map((card, index) => (card !== -1 ? index : card))
        .filter((value) => value !== -1);
      gameStateStore.playCards(remainHand);
      setSelectedCardIndices(remainHand);
      playedCards = remainHand.map((index) => gameStateStore.cards[index]);
    } else {
      gameStateStore.playCards(selectCardIndices);
      playedCards = selectCardIndices.map(
        (index) => gameStateStore.cards[index]
      );
    }
    await wait(1000);
    setSelectedCardIndices([]);

    //Send to server
    const payload = { action: "playCard", playedCards: playedCards };
    sendToServer(state.ws, "game", payload);
  };

  const handleCallAction = () => {
    if (isSending) return;
    if (gameStateStore.turn !== state.order) {
      console.log("Invalid player turn");
      return;
    }
    if (gameStateStore.lastPlayedBy.length == 0) {
      console.log("Invalid call");
      return;
    }
    setIsSending(true);
    setSelectedCardIndices([]);

    const payload = { action: "call" };
    sendToServer(state.ws, "game", payload);
  };

  useEffect(() => {
    if (gameStateStore.lastPlayedBy.slice(-1)[0] == state.order) {
      setIsSending(false);
    }
  }, [gameStateStore.lastPlayedBy]);

  const [isNextTableRequest, setIsNextTableRequest] = useState(false);
  const handleRequestNextTable = () => {
    setIsNextTableRequest(true);
  };

  useEffect(() => {
    if (!isNextTableRequest) return;

    if (gameStateStore.currentState == "toNextRound") {
      handleConfirmRoundEnd();
    }
    if (gameStateStore.currentState == "toNextGame") {
      handleConfirmGameEnd();
    }

    setIsNextTableRequest(false);
  }, [isNextTableRequest, gameStateStore.currentState]);

  const handleConfirmRoundEnd = () => {
    //TODO : change; may change to confirm with each player (w/chance left/active)
    //send nextround/game request; if all fullfil confirm next action,
    //currently make the caller send the message for simplicity
    if (gameStateStore.turn != state.order) return;

    //TODO: reset client state (called card/ lastplaycardcount)
    sendNextRoundMessageToServer(state.ws);
    setIsSending(false);
  };

  const handleConfirmGameEnd = () => {
    if (gameStateStore.turn != state.order) return;

    sendNextGameMessageToServer(state.ws);
    setIsSending(false);
  };

  return (
    <div className="w-screen h-screen bg-primary flex items-center justify-center overflow-hidden">
      <div className="relative max-w-screen-xl w-full h-full flex flex-col">
        {/* MAIN AREA*/}
        <div className="flex flex-1 flex-col relative w-full h-full">
          {/* TABLE */}
          <div className="flex flex-1 relative">
            <TableContainer
              playerOrder={state.order}
              handleRequestNextTable={handleRequestNextTable}
            />
          <UserBanner users={state.users} order={state.order}/>
          </div>
          {/* PLAYER HAND */}
          <div className="self-end items-center justify-center flex w-full">
            <div className="flex flex-col items-center justify-center -space-y-6 w-full px-4 sm:mb-0 mb-6">
              <CardContainer
                cards={gameStateStore.cards}
                selectCardIndices={selectCardIndices}
                handleSelectCard={handleSelectCard}
              />
              <PlayerActionContainer
                handleCallAction={handleCallAction}
                handlePlayCardAction={handlePlayCardAction}
                turn={gameStateStore.turn}
                order={state.order}
                isSending={isSending}
                lastPlayedBy={gameStateStore.lastPlayedBy}
                selectCardIndices={selectCardIndices}
              />
            </div>
          </div>
        </div>
        {/* BOTTOM PANEL */}
        <div className="w-full flex flex-col items-center justify-center px-4 pb-12 ">
          <ChatBox
            chats={state.chats}
            chatInput={state.chatInput}
            handleMessageSend={handleChatMessageSend}
            dispatch={dispatch}
          />
          <UserPanel
            users={state.users}
            ws={state.ws}
            displayName={state.displayName}
            order={state.order}
            roomUrl={wsId}
            dispatch={dispatch}
            handleSendNameChange={handleSendNameChange}
          />
        </div>
      </div>

      {/* state report */}
      {/* <div className="flex flex-col absolute top-0 left-0 text-sm">
        {state.eventslog.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div> */}
      {/* for test game logic panel */}
      <button
        className="text-sm absolute top-0 right-0 font-pixelify"
        onClick={() => setShow(!show)}
      >
        show gameState
      </button>
      <button
        className="text-sm absolute top-4 right-0 font-pixelify"
        onClick={() => sendStartMessageToServer(state.ws)}
      >
        start
      </button>
      <div className={`absolute right-0 top-6 text-sm ${show ? "" : "hidden"}`}>
        <div>playerOrder : {state.order}</div>
        <div>gameState: {gameStateStore.currentState}</div>
        <div>turn: {gameStateStore.turn}</div>
        <div>round: {gameStateStore.round}</div>
        <div>roundPlayCard: {gameStateStore.roundPlayCard}</div>
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
        <div>forcePlayOrder: {gameStateStore.forcePlayerOrder}</div>
        <div>isSending: {isSending.toString()}</div>
        <div className="flex flex-col">
          <a href="http://localhost:5173" className="border border-black px-2">
            home
          </a>
          <a
            href={`http://localhost:5173/ws/${wsId}`}
            rel="noopener noreferrer"
            target="_blank"
            className="border border-black px-1"
          >
            NewInstant
          </a>
          <button className="border border-black px-1" onClick={handleSim}>
            add player
          </button>
          <button
            className="border border-black px-1"
            onClick={() => sendStartMessageToServer(state.ws)}
          >
            Start
          </button>
          <div>action</div>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
          <div>data</div>
          <input
            type="text"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <button onClick={() => sendToServer(state.ws, "game", payload)}>
            send
          </button>
        </div>
      </div>
    </div>
  );
}
