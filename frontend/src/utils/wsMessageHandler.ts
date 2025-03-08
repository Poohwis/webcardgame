import { GameState } from "../store/gameStateStore";
import { Action,  MessageEventPayload, User } from "../type";
import handleGameAction from "./handleGameAction";

export function handleWebSocketMessage(
  e: MessageEvent,
  dispatch: React.Dispatch<Action>,
  usersRef: React.MutableRefObject<User[]>,
  gameStateStore : GameState
) {
  const message: MessageEventPayload = JSON.parse(e.data);
  console.log(message)
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
          isAnnounce: "in",
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
          isAnnounce: "out",
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
          isAnnounce: "nameChange",
          order: payload.order,
          displayName: payload.displayName,
          prevName: payload.prevName,
          message: "",
        },
      });
      break;
      
      case "game" :
        handleGameAction(payload, gameStateStore)
        console.log(payload)
        break

    default:
      console.warn("Unhandled message type:", message);
  }

  dispatch({ type: "ADD_EVENT", payload: e.data });
}
