import { sendToServer } from "./sendTosServer";

export function sendStartMessageToServer(ws: WebSocket | null) {
  const payload = { action: "start" };
  sendToServer(ws, "game", payload);
}

export function sendNextRoundMessageToServer(ws : WebSocket | null) {
  const payload = {action : "nextRound"}
  sendToServer(ws, "game", payload)
}

export function sendNextGameMessageToServer(ws : WebSocket | null) {
  const payload = { action : "nextGame"}
  sendToServer(ws, "game", payload)
}