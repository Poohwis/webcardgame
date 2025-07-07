import { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Action, Chat, User } from "../type";
import ChatBox from "../components/ChatBox";
import { handleWebSocketMessage } from "../utils/wsMessageHandler";
import { sendToServer } from "../utils/sendTosServer";
import {
  sendNextGameMessageToServer,
  sendNextRoundMessageToServer,
} from "../utils/sendToServerGameMessage";
import { useGameStateStore } from "../store/gameStateStore";
import PlayerActionContainer from "../components/PlayerActionButtonContainer";
import CardContainer from "../components/CardContainer";
import wait from "../utils/wait";
import TableContainer from "../components/TableContainer";
import UserBanner from "../components/UserBanner";
import CallResultTextContainer from "../components/CallResultTextContainer";
import GameNumberIndicator from "../components/GameNumberIndicator";
import {
  InGameAnnounceType,
  useInGameAnnounceStore,
} from "../store/inGameAnnounceStore";
import { useTableStateStore } from "../store/tableStateStore";
import StartGameMenu from "../components/StartGameMenu";
import GameEndModal from "../components/GameEndModal";
import TempAnimationDisplay from "../components/_TempAnimationDisplay";
import { useTableAnimationStore } from "../store/tableAnimationStore";
import { useCardAnimationStore } from "../store/cardAnimationStore";
import TempGameStatus from "../components/_TempGameStatus";
import { useWindowSizeStore } from "../store/windowSizeStateStore";
import UserList from "../components/UserList";
import UserNameEditButton from "../components/UserNameEditButton";
import { useGeneralAnnounceStore } from "../store/generalAnnounceStore";

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
  errorMessage: "",
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
    case "SET_ERRORMESSAGE":
      return { ...state, errorMessage: action.payload };
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
  const { resetTableState, resetPointerAndRingState } = useTableStateStore();
  const { resetGameState } = useGameStateStore();
  const { clearTableQueue } = useTableAnimationStore();
  const { clearQueue } = useCardAnimationStore();
  const { setAnnounce } = useInGameAnnounceStore();
  const { setIsSmallWindow, setWindowHeight } =
    useWindowSizeStore();
  const generalAnnounceStore = useGeneralAnnounceStore();

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      if (window.innerWidth < 640) {
        setIsSmallWindow(window.innerWidth < 640);
      } else {
        setIsSmallWindow(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    usersRef.current = state.users;
  }, [state.users]);

  const handleResetGame = () => {
    resetTableState();
    resetGameState();
    clearQueue();
    clearTableQueue();
    resetPointerAndRingState();
  };

  useEffect(() => {
    //TODO : change to use environment variable for ws
    gameStateStore.resetGameState();
    resetTableState();

    const ws = new WebSocket(`ws://localhost:8080/ws/${wsId}`);

    const handleMessage = (e: MessageEvent) => {
      handleWebSocketMessage(
        e,
        dispatch,
        usersRef,
        gameStateStore,
        generalAnnounceStore,
        handleResetGame
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

  const handleSendNameChange = (newName: string) => {
    // if (state.displayName.length < 1 || state.displayName.length > 16) {
    if (newName.length < 1 || newName.length > 16) {
      console.log("struck");
      return;
    }
    // const payload = { newName: state.displayName.trim() };
    const payload = { newName: newName.trim() };
    sendToServer(state.ws, "nameChange", payload);
  };

  if (state.error) {
    navigate("/notfound");
    return null;
  }
  if (state.errorMessage !== "") {
    navigate("/notfound", { state: { type: state.errorMessage } });
    return null;
  }

  const handleSelectCard = (index: number) => {
    setSelectedCardIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        if (selectCardIndices.length == 3) {
          setAnnounce(InGameAnnounceType.CardSelectExceed);
          return prev;
        }
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

  useEffect(() => {
    if (
      gameStateStore.turn === state.order &&
      gameStateStore.forcePlayerOrder !== -1
    ) {
      setAnnounce(InGameAnnounceType.ForceThrowAll);
    }
  }, [gameStateStore.forcePlayerOrder]);

  return (
    <div
      className="w-screen h-screen flex items-center justify-center overflow-hidden
    bg-radial from-primary via-lime-200 to-cyan-800"
    >
      <GameEndModal ws={state.ws} users={state.users} />
      <StartGameMenu ws={state.ws} users={state.users} roomUrl={wsId} />
      <div className="relative max-w-screen-2xl w-full h-full flex flex-col">
        {/* MAIN AREA*/}
        <div className="flex flex-1 flex-col relative w-full h-full">
          <GameNumberIndicator />
          {/* TABLE */}
          <div className="flex flex-1 relative">
            <TableContainer
              users={state.users}
              playerOrder={state.order}
              handleRequestNextTable={handleRequestNextTable}
            />
            <UserBanner users={state.users} order={state.order} />
            <CallResultTextContainer />
          </div>
          {/* PLAYER HAND */}
          <div className="self-end items-center justify-center flex w-full">
            {/* <div className="self-end items-center justify-center flex w-full"> */}
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
        <div className=" w-full flex flex-col items-center justify-center px-4 sm:mb-12 sm:mt-4 mb-4 space-y-4">
          <div className="sm:translate-y-0">
            <UserList users={state.users} />
          </div>
          <div className="absolute left-0 bottom-6">
            <ChatBox
              chats={state.chats}
              chatInput={state.chatInput}
              handleMessageSend={handleChatMessageSend}
              dispatch={dispatch}
            />
          </div>
        </div>
        <div className="absolute sm:bottom-12 sm:right-10 top-4 right-2 sm:top-auto">
          <UserNameEditButton
            displayName={state.displayName}
            order={state.order}
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
      <TempGameStatus
        state={state}
        isSending={isSending}
        selectCardIndices={selectCardIndices}
        wsId={wsId}
      />
      <TempAnimationDisplay />
    </div>
  );
}
