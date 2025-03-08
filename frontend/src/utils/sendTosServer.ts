
export function sendToServer(
  ws: WebSocket | null,
  type: string,
  payload: object,
) {
  if (!ws) return; 

  const jsonMsg = JSON.stringify({ type, payload });

  ws.send(jsonMsg);

}
