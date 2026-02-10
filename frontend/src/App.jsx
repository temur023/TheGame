import CreatePlayer from "./CreatePlayer"
import GetAllMatches from "./GetAllMatches"
import GameBoard from "./GameBoard";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/register" element={<CreatePlayer />}></Route>
            <Route path="/getall" element={<GetAllMatches />}></Route> 
            <Route path="/game/:matchId" element={<GameBoard />} />
            <Route path="/" element={<CreatePlayer/>}></Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
