import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:wsId" element={<Room />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  );
}
