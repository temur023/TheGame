import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GetAllMatches() {
    const [showModal, setShowModal] = useState(false);
    const [roomPassword, setRoomPassword] = useState("");
    const [matches, setMatches] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState({
        pageNumber: 1,
        pageSize: 10
    });

    const navigate = useNavigate();
    const api_url = "http://localhost:5104";
    const currentPlayerName = localStorage.getItem("playerName");

    const fetchData = async () => {
        await fetchMatches();
        await fetchLeaderboard();
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get(`${api_url}/api/Match/leaderboard`);
            if (response.data.statusCode === 200) {
                setLeaderboard(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        }
    };

    const fetchMatches = async () => {
        try {
            const requestParams = {
                PageSize: filter.pageSize,
                PageNumber: filter.pageNumber
            };
            const response = await axios.get(`${api_url}/api/Match/get-all`, {
                params: requestParams
            });

            if (response.data.statusCode === 200) {
                setMatches(response.data.data);
                setTotal(response.data.totalRecords || 0);
            }
        } catch (error) {
            setMessage({ text: "Error loading matches", type: "danger" });
        }
    };

    // Removed handleAiMatchCreation from here

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [filter.pageNumber, filter.pageSize]);

    const myStats = leaderboard.find(p => p.name === currentPlayerName) || { wins: 0, draws: 0, losses: 0 };

    const getStatusBadge = (match) => {
        // Removed AI specific badge logic
        switch (match.matchStatus) {
            case 0: return <span className="badge rounded-pill bg-primary-subtle text-primary">Waiting</span>;
            case 1: return <span className="badge rounded-pill bg-warning-subtle text-warning">In Progress</span>;
            case 2: return <span className="badge rounded-pill bg-secondary-subtle text-secondary">Finished</span>;
            default: return <span className="badge rounded-pill bg-light text-dark">Unknown</span>;
        }
    };

    const handleJoin = async (matchId, hasPassword) => {
        let passwordInput = null;
        if (hasPassword) {
            passwordInput = prompt("Enter room password:");
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
            alert(error.response?.data?.message || "Failed to join");
        }
    };

    const handleMatchCreation = async () => {
        try {
            const pId = parseInt(localStorage.getItem("playerId"));
            const matchData = {
                Player1Id: pId,
                CurrentPlayerName: currentPlayerName || "Guest",
                MatchPassword: roomPassword ? parseInt(roomPassword, 10) : null
            };

            const response = await axios.post(`${api_url}/api/Match/create`, matchData);
            if (response.data.statusCode === 200) {
                setShowModal(false);
                navigate(`/game/${response.data.data}`);
            }
        } catch (error) {
            alert("Failed to create match");
        }
    };

    const totalPages = Math.ceil(total / filter.pageSize);

    return (
        <div className="container-fluid min-vh-100 w-100" style={{
            backgroundImage: `url('https://c8.alamy.com/comp/2GGD3MM/tic-tac-toe-game-texture-hand-drawn-seamless-cross-shapes-pattern-black-elements-on-white-background-2GGD3MM.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
        }}>
            <div className="row pt-5 justify-content-center px-3">
                <div className="col-lg-7 mb-4">
                    <div className="card shadow border-0 p-4 bg-white rounded-4 h-100">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="fw-bold m-0 text-dark">Game Lobby</h2>
                                <p className="text-muted small mb-0">Welcome back, <strong>{currentPlayerName}</strong>!</p>
                            </div>

                            <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                                <div className="d-flex align-items-center me-3">
                                    <div className="text-center px-2 border-end">
                                        <div className="fw-bold text-success small">{myStats.wins}</div>
                                        <div className="text-muted x-small" style={{fontSize: '0.6rem'}}>WINS</div>
                                    </div>
                                    <div className="text-center px-2  border-end">
                                        <div className="fw-bold text-warning small">{myStats.draws}</div>
                                        <div className="text-muted x-small" style={{fontSize: '0.6rem'}}>DRAWS</div>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="fw-bold text-danger small">{myStats.losses}</div>
                                        <div className="text-muted x-small" style={{fontSize: '0.6rem'}}>LOSSES</div>
                                    </div>
                                    
                                </div>
                                
                                {/* AI BUTTON REMOVED FROM HERE */}
                                
                                <button className="btn btn-primary fw-bold shadow-sm" onClick={() => setShowModal(true)}>
                                    + Create Match
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Host</th>
                                        <th>Status</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.length > 0 ? (
                                        matches.map((m) => (
                                            <tr key={m.id} className="align-middle">
                                                <td className="fw-semibold">
                                                    {m.player1?.name || m.currentPlayerName}
                                                    {m.matchPassword && <span className="ms-2">🔒</span>}
                                                </td>
                                                <td>{getStatusBadge(m)}</td>
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm px-4 fw-bold"
                                                        disabled={m.matchStatus !== 0}
                                                        onClick={() => handleJoin(m.id, !!m.matchPassword)}
                                                    >
                                                        {m.matchStatus === 0 ? "Join" : "Full"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center py-5">No games available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <nav className="mt-auto">
                            <ul className="pagination justify-content-center mb-0 pt-3">
                                <li className={`page-item ${filter.pageNumber <= 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setFilter({ ...filter, pageNumber: filter.pageNumber - 1 })}>Prev</button>
                                </li>
                                <li className="page-item active"><span className="page-link">{filter.pageNumber}</span></li>
                                <li className={`page-item ${filter.pageNumber >= totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setFilter({ ...filter, pageNumber: filter.pageNumber + 1 })}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="card shadow border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-dark text-warning text-center fw-bold py-3">
                             HALL OF FAME
                        </div>
                        <ul className="list-group list-group-flush">
                            {leaderboard.map((p, i) => (
                                <li key={i} className={`list-group-item d-flex justify-content-between align-items-center py-3 ${p.name === currentPlayerName ? 'bg-warning-subtle' : ''}`}>
                                    <div>
                                        <span className={`badge me-2 ${i === 0 ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>#{i + 1}</span>
                                        <span className={`fw-bold ${p.name === currentPlayerName ? 'text-primary' : ''}`}>
                                            {p.name} {p.name === currentPlayerName && "(You)"}
                                        </span>
                                    </div>
                                    <div className="text-end">
                                        <div className="small fw-bold text-primary">{p.wins} Wins</div>
                                        <div className="text-muted small">{p.losses}L / {p.draws}D</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Create New Match</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Room Password (Optional)</label>
                                    <input 
                                        type="number" className="form-control" placeholder="Leave blank for public"
                                        value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary px-4" onClick={handleMatchCreation}>Start Game</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GetAllMatches;