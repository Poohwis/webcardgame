export type User = {
  displayName: string;
  order: number;
};

export type Chat = {
  isAnnounce?: "in" | "out" | "nameChange";
  displayName: string;
  order: number;
  message: string;
  prevName?: string;
};

export type Action =
  | { type: "SET_WS"; payload: WebSocket }
  | { type: "SET_CHAT"; payload: string }
  | { type: "ADD_CHAT"; payload: Chat }
  | { type: "SET_GAME"; payload: string }
  | { type: "SET_DISPLAYNAME"; payload: string }
  | { type: "SET_ORDER"; payload: number }
  | { type: "UPDATE_USERS"; payload: User[] }
  | { type: "ADD_EVENT"; payload: string }
  | { type: "SET_ERROR" }
  | { type: "SET_CARD"; payload: number[] };

// export type State = {
//   ws: WebSocket | null;
//   chatInput: string;
//   chats: Chat[];
//   game: string;
//   displayName: string;
//   order: number;
//   users: User[];
//   eventslog: string[];
//   error: boolean;
// };

export type InitializeSlotMessage = {
  type: "initializeSlot";
  payload: { displayName: string; order: number };
};
export type UpdateUserListMessage = {
  type: "updateUserList";
  payload: { users: User[] };
};
export type ChatMessage = {
  type: "chat";
  payload: {
    order: number;
    message: string;
  };
};

export type AnnounceMessage = {
  type: "in" | "out";
  payload: { order: number; displayName: string };
};

export type NameChangeMessage = {
  type: "nameChange";
  payload: { displayName: string; prevName: string; order: number };
};

export type StartGameMessage = {
  type: "game";
  payload: { action: "start"; cards: number[] };
};
export type PlayCardGameMessage = {
  type: "game";
  payload: { action: "playCard" };
};
export type CallGameMessage = {
  type: "call";
  payload: { action: "call" };
};
export type NextRoundRequestGameMessage = {
  type: "game";
  payload: { action: "nextRound" };
};
export type NextGameRequestGameMessage = {
  type: "game";
  payload: { action: "nextGame" };
};
export type WaitGameMessage = {
  type: "game";
  payload: { action: "wait" };
};
export type toNextRoundGameMessage = {
  type: "game";
  payload: { action: "toNextRound" };
};
export type toNextGameGameMessage = {
  type: "game";
  payload: { action: "toNextGame" };
};

export type GameMessage =
  | StartGameMessage
  | PlayCardGameMessage
  | CallGameMessage
  | NextRoundRequestGameMessage
  | WaitGameMessage
  | NextGameRequestGameMessage
  | toNextRoundGameMessage
  | toNextGameGameMessage;
export type MessageEventPayload =
  | InitializeSlotMessage
  | UpdateUserListMessage
  | ChatMessage
  | AnnounceMessage
  | NameChangeMessage
  | GameMessage;
