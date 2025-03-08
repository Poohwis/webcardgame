import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

const Temp = () => {
  const [roomURL, setRoomURL] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("")
  const { sendMessage, lastMessage } = useWebSocket(roomURL, {
    onMessage: (event) => {
        const parsed = JSON.parse(event.data)
          return setMessages((prev) => [...prev, parsed.content]);
      },
  });

  const [tempText, setTempText] = useState("")
  const createRoom = async () => {
    const res = await fetch("http://localhost:8080/create");
    const url = await res.text();
    console.log(url)
    setRoomURL(url.replace("http", "ws")); // WebSocket URL
  };

  const handleSend = () => {
    const jsonMsg = JSON.stringify({sender : name, content: message})
    sendMessage(jsonMsg);
    setMessage("");
  };

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      <div>username</div>
      <input type="text" onChange={(e)=>setName(e.target.value)} />
      <div>input slug</div>
      <input type="text" onChange={(e)=>setTempText(e.target.value)} />
      <button onClick={()=>setRoomURL(`ws://localhost:8080/ws/${tempText}`)}>go to: {tempText}</button>
      <div>Room URL: {roomURL}</div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSend}>Send</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Temp;
