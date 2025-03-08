import { useNavigate } from "react-router-dom";
import { SERVER_LINK } from "../link";
export default function HomePage() {
  const navigate = useNavigate();
  // const [errMsg, setErrMsg] = useState("")
   const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${SERVER_LINK}/create`);
      const roomURL = await response.text();

      const roomId = roomURL.split("/").pop();
      navigate(`/ws/${roomId}`);
    } catch (err) {
      //TODO:show the error 
      console.error("Error creating room:", err);
    }
  };
  return (
      <div className=" flex items-center justify-center w-screen h-screen bg-primary ">
        <div className="flex flex-col font-nippo">
          <h1 className="text-xl">Liar's card</h1>
          <button
            onClick={handleCreateRoom}
            type="submit"
            className=" text-black text-base hover:cursor-pointer"
          >
            Create room
          </button>
        </div>
      </div>
  );
}
