import { sendToServer } from "./sendTosServer";

export function sendStartMessageToServer(
  ws: WebSocket | null,
  endGameScore: number
) {
  const payload = { action: "start", endGameScore };
  sendToServer(ws, "game", payload);
}

export function sendNextRoundMessageToServer(ws: WebSocket | null) {
  const payload = { action: "nextRound" };
  sendToServer(ws, "game", payload);
}

export function sendNextGameMessageToServer(ws: WebSocket | null) {
  const payload = { action: "nextGame" };
  sendToServer(ws, "game", payload);
}

export function sendResetMessageToServer(ws: WebSocket | null) {
  const payload = { action: "reset" };
  sendToServer(ws, "game", payload);
}
