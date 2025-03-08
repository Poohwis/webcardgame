import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen bg-primary flex items-center justify-center flex-col">
      <h1 className="font-nippo text-xl ">Room not found</h1>
      <button
        onClick={() => navigate("/")}
        className="font-nippo hover:cursor-pointer hover:underline "
      >
        go back
      </button>
    </div>
  );
}
