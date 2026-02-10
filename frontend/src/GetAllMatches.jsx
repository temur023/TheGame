import React, {useState, useEffect, use} from "react";
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";
function GetAllMatches(){
    const [showModal, setShowModal] = useState(false);
    const [roomPassword, setRoomPassword] = useState("");
    const [matches, setMatches] = useState([]);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState({
        pageNumber: 1,
        pageSize: 10
    });
    const navigate = useNavigate();
    const api_url = "http://localhost:5104";

const handleJoin = async (matchId, hasPassword) => {
    let passwordInput = null;

    if (hasPassword) {
        passwordInput = prompt("This room is private. Please enter the password:");
        if (!passwordInput) return; 
    }

    try {
        const playerId = localStorage.getItem("playerId");
        const dto = {
            MatchId: matchId,
            Player2Id: parseInt(playerId),
            Password: passwordInput ? parseInt(passwordInput) : null
        };

        const response = await axios.put(`${api_url}/api/Match/join-match`, dto);

        if (response.data.statusCode === 200) {
            navigate(`/game/${matchId}`);
        }
    } catch (error) {
        alert(error.response?.data?.message || "Failed to join match");
    }
};
   const handleMatchCreation = async () => {
    try {
        const storedId = localStorage.getItem("playerId");
        const playerName = localStorage.getItem("playerName");

        const pId = storedId ? parseInt(storedId, 10) : 0;

        if (!pId || isNaN(pId)) {
            alert("Player ID missing. Try logging in again.");
            return;
        }

        const matchData = {
            Player1Id: pId,
            CurrentPlayerName: playerName || "Guest",
            MatchPassword: roomPassword ? parseInt(roomPassword, 10) : null 
        };

        const response = await axios.post(`${api_url}/api/Match/create`, matchData);

        if (response.data.statusCode === 200) {
            setShowModal(false);
            navigate(`/game/${response.data.data}`); 
        }
    } catch (error) {
        console.error("API Error Details:", error.response?.data);
        alert(error.response?.data?.message || "Failed to create match");
    }
};
    const fetchMatches = async() =>{
        try{
        const requestParams = {
            PageSize: filter.pageSize,
            PageNumber: filter.pageNumber
        }
        const response = await axios.get(`${api_url}/api/Match/get-all`,{
            params: requestParams
        });
        if(response.data.statusCode===200){
            setMatches(response.data.data)
            
        }
        setTotal(response.data.totalRecords || 0);
        }catch(error){
            setMessage({text:error.response?.data?.message, type:"danger"})
        }
    }
    const totalPages = Math.ceil(total/filter.pageSize)
    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 5000);
        return () => clearInterval(interval);
    }, [filter.pageNumber, filter.pageSize]);
    useEffect(() => {
    fetchMatches();
}, [filter.pageNumber]);
    return(
        <>
            <div className="container-fluid bg-light w-100 vh-100 d-flex justify-content-center " style={{
            backgroundImage: `url('https://c8.alamy.com/comp/2GGD3MM/tic-tac-toe-game-texture-hand-drawn-seamless-cross-shapes-pattern-black-elements-on-white-background-2GGD3MM.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat' }}>
                <div className="card col-11 m-5 bg-blue align-items-center">
                    <h1 className="mt-3">Game Lobby</h1>
                    <button 
                        className="col-3 btn btn-primary fw-bold shadow-sm" 
                        onClick={() => setShowModal(true)}
                    >
                        + Create Match
                    </button>
                    <div className="col-8 table-responsive mt-4">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Player Name</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.length > 0 ? (
                                    matches.map((matchItem) => (
                                        <tr key={matchItem.id} className="align-middle">
                                            <td>
                                                {matchItem.currentPlayerName} 
                                                {matchItem.matchPassword && <span className="ms-2">🔒</span>}
                                            </td>
                                            <td>
                                                <span className="badge rounded-pill bg-success-subtle text-success">
                                                    Waiting...
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                    className="btn btn-primary btn-sm px-4"
                                                    onClick={() => handleJoin(matchItem.id, !!matchItem.matchPassword)}
                                                >
                                                    Join
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            No matches found. Create one to start!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <nav>
                        <ul className="pagination d-flex justify-content-center">
                            <li className={`page-item ${filter.pageNumber <= 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setFilter(filter.pageNumber - 1)}>Previous</button>
                            </li>
                            {(() => {
                                let startPage = Math.max(1, filter.pageNumber - 2);
                            
                                return [...Array(totalPages<5?totalPages:5)].map((_, i) => {
                                    const pageNum = startPage + i;
                                    return (
                                        <li key={pageNum} className={`page-item ${filter.pageNumber === pageNum ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setFilter(pageNum)}>{pageNum}</button>
                                        </li>
                                    );
                                });
                            })()}
                            <li className={`page-item ${filter.pageNumber >= totalPages ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => setFilter({ ...filter, pageNumber: filter.pageNumber + 1 })}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                    </div>
                </div>
            </div>
             {showModal && (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Create New Match</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                    <p className="text-muted small">If you want a private game, set a password below. Otherwise, leave it blank.</p>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Match Password (Optional)</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            placeholder="e.g. 1234"
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleMatchCreation}>Create & Start</button>
                </div>
            </div>
        </div>
    </div>
)}               
        </>
    );
}
export default GetAllMatches;