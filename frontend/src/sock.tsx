import { s } from "motion/react-client"
import { useState, useEffect } from "react"

export default function Sock () {
    const [socketUrl, setSocketUrl] = useState("")
    const [name, setName] = useState("")
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [temp, setTemp] = useState("")

    const createRoom = async() => {
        //user create and then join the room
        const res = await fetch("http://localhost:8080/create", {method : "POST"})
        const url = await res.text()
        const ws = new WebSocket(url.replace("http", "ws"))
        setSocketUrl(url)
        setWs(ws)
    }

    const handleSend = () => {
        if (ws) {
            const jsonMsg = JSON.stringify({sender: name, content: message})
            ws.send(jsonMsg)
            setMessage("")
        }
    }

    const handleJoinRoom = () => {
        //1.extract param from frontend url (http:5173) if the param contain ws
        //2.connect socket with go backend (ws:8080)
        const ws = new WebSocket(temp.replace("http", "ws"))
        setSocketUrl(String(ws))
        setWs(ws)
        
    }
    useEffect(()=>{
        const path = window.location.pathname
        console.log(path)
        if(path.includes("/ws")){
            const wsUrl = `ws://localhost:8080${path}`
            const ws = new WebSocket(wsUrl)
            setSocketUrl(wsUrl)
            setWs(ws)
        }

    },[])

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                console.log("Received message:", data)
                setMessages((prev)=> [...prev, data])
            }
        }
    }, [ws])
    
    return (
        <div>
            <button onClick={createRoom}>create room</button>
            <input type="text" onChange={(e)=>setTemp(e.target.value)} />
            <button onClick={handleJoinRoom}>join</button>
            <div>name</div>
            <input type="text" onChange={(e) => setName(e.target.value)} />
            <div>message</div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSend}>send</button>
            <div>socketUrl:</div>
            <div>{socketUrl}</div>
            <ul>
                {messages.map((msg, index)=>(
                <li key={index}>{msg.sender} {msg.content}</li>
                ))}
            </ul>
        </div>
    )
}