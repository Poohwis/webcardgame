import { GameState } from "../store/gameStateStore";
import {
  GeneralAnnounceState,
  GeneralAnnounceType,
} from "../store/generalAnnounceStore";
import { Action, MessageEventPayload, User } from "../type";
import handleGameAction from "./handleGameAction";

export function handleWebSocketMessage(
  e: MessageEvent,
  dispatch: React.Dispatch<Action>,
  usersRef: React.MutableRefObject<User[]>,
  gameStateStore: GameState,
  generalAnnounceStore: GeneralAnnounceState,
  handleResetGame: () => void
) {
  const message: MessageEventPayload = JSON.parse(e.data);
  console.log(message);
  const { type, payload } = message;

  switch (type) {
    case "initializeSlot":
      dispatch({ type: "SET_DISPLAYNAME", payload: payload.displayName });
      dispatch({ type: "SET_ORDER", payload: payload.order });
      break;

    case "updateUserList":
      dispatch({ type: "UPDATE_USERS", payload: payload.users });
      break;

    case "chat":
      const user = usersRef.current.find(
        (u: User) => u.order === payload.order
      );
      if (user) {
        dispatch({
          type: "ADD_CHAT",
          payload: {
            displayName: user?.displayName,
            order: payload.order,
            message: payload.message,
          },
        });
      }
      break;

    case "in":
      dispatch({
        type: "ADD_CHAT",
        payload: {
          announceType: "in",
          order: payload.order,
          displayName: payload.displayName,
          message: "",
        },
      });
      break;

    case "out":
      dispatch({
        type: "ADD_CHAT",
        payload: {
          announceType: "out",
          order: payload.order,
          displayName: payload.displayName,
          message: "",
        },
      });
      break;

    case "nameChange":
      dispatch({
        type: "ADD_CHAT",
        payload: {
          announceType: "nameChange",
          order: payload.order,
          displayName: payload.displayName,
          prevName: payload.prevName,
          message: "",
        },
      });
      break;

    case "nameChangeStatus":
      if (payload.isReject) {
        generalAnnounceStore.setGeneralAnnounce(
          GeneralAnnounceType.RejectNameChange
        );
        dispatch({ type: "SET_DISPLAYNAME", payload: payload.name });
        return;
      }
      generalAnnounceStore.setGeneralAnnounce(
        GeneralAnnounceType.SuccessNameChange
      );
        dispatch({ type: "SET_DISPLAYNAME", payload: payload.name });
      break;

    case "game":
      handleGameAction(payload, gameStateStore, handleResetGame);
      break;

    case "error":
      dispatch({ type: "SET_ERRORMESSAGE", payload: payload.type });
      break;

    default:
      console.warn("Unhandled message type:", message);
  }

  dispatch({ type: "ADD_EVENT", payload: e.data });
}
