import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function GameBoard() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [connection, setConnection] = useState(null);
    const [chatMessage, setChatMessage] = useState("");
    const [chatLog, setChatLog] = useState([]);
    const api_url = "http://localhost:5104";

    const chatEndRef = useRef(null);
    const connectionRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLog]);

    const handleExit = () => {
        navigate('/getall');
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await axios.get(`${api_url}/api/Match/${matchId}`);
                if (res.data && res.data.data) {
                    setMatch(res.data.data);
                }
            } catch (err) {
                console.error("Initial load failed:", err);
            }
        };

        fetchInitialData();

        if (!connectionRef.current) {
            const newConnection = new HubConnectionBuilder()
                .withUrl(`${api_url}/gamehub`)
                .withAutomaticReconnect()
                .build();

            connectionRef.current = newConnection;


            newConnection.on("ReceiveChatMessage", (user, message) => {
                setChatLog((prev) => [...prev, { user, message }]);
            });

            newConnection.on("ReceiveUpdate", (updatedMatch) => {
                setMatch(updatedMatch);
            });

            newConnection.start()
                .then(() => {
                    newConnection.invoke("JoinGame", parseInt(matchId));
                    setConnection(newConnection);
                })
                .catch(e => console.error("Connection failed: ", e));
        }

        return () => {
            if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [matchId, navigate]);

    const sendChat = async () => {
        if (chatMessage.trim() === "" || !connection) return;
        const playerName = localStorage.getItem("playerName") || "Guest";
        try {
            await connection.invoke("SendChatMessage", parseInt(matchId), playerName, chatMessage);
            setChatMessage("");
        } catch (err) {
            console.error("Chat failed: ", err);
        }
    };

    const handleSquareClick = async (index) => {
        const myId = parseInt(localStorage.getItem("playerId"));
        if (!match || match.matchStatus === 2) return; 
        if (match.currentPlayerId !== myId) return;

        const board = match.boardState.split(',');
        if (board[index] !== "EMPTY") return;

        if (connection?.state === HubConnectionState.Connected) {
            try {
                const moveDto = {
                    matchId: parseInt(matchId),
                    playerId: myId,
                    cellIndex: index
                };
                await connection.invoke("SendMove", moveDto);
            } catch (err) {
                console.error("Move failed: ", err);
            }
        }
    };

    const myId = parseInt(localStorage.getItem("playerId"));
    const isMyTurn = match?.currentPlayerId === myId;
    const isGameOver = match?.matchStatus === 2;

    return (
        <div className="w-100 vh-100" style={{
      backgroundImage: `url('https://s3-alpha.figma.com/hub/file/6054887559/58e68a4b-b1a7-40d6-828a-ab80f7c2e9b1-cover.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed' 
    }}>
        <div className="container" >
            <h2 className="text-center mb-4" style={{color: 'white'}}>Match Room #{matchId}</h2>

            {match ? (
                <div className="row justify-content-center">
                    <div className="col-lg-6 d-flex flex-column align-items-center mb-4 ">
                        
                        <div className={`alert w-100 text-center fw-bold shadow-sm ${
                            isGameOver ? 'alert-success' : isMyTurn ? 'alert-primary' : 'alert-warning'
                        }`}>
                            {isGameOver ? (
                                <div className="d-flex flex-column align-items-center">
                                    <span className="mb-2">
                                        {match.winnerName === "Draw" ? " It's a Draw!" : ` Winner: ${match.winnerName}`}
                                    </span>
                                    <button 
                                        className="btn btn-primary btn-sm fw-bold" 
                                        onClick={handleExit}
                                    >
                                        Return to Lobby
                                    </button>
                                </div>
                            ) : (
                                <span>
                                    {isMyTurn ? " Your turn!" : ` Wait for ${match.currentPlayerName}...`}
                                </span>
                            )}
                        </div>

                        <div className="tic-tac-toe-grid shadow p-3 bg-white rounded">
                            {match.boardState.split(',').map((cell, i) => (
                                <button
                                    key={i}
                                    className={`square-btn ${cell !== "EMPTY" ? "filled" : ""} ${isMyTurn && !isGameOver && cell === "EMPTY" ? "active-turn" : ""}`}
                                    onClick={() => handleSquareClick(i)}
                                    disabled={cell !== "EMPTY" || isGameOver || !isMyTurn}
                                >
                                    {cell === "X" && <span className="text-primary display-4 fw-bold">X</span>}
                                    {cell === "O" && <span className="text-danger display-4 fw-bold">O</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-dark text-white fw-bold">Match Chat</div>
                            <div className="card-body bg-light" style={{ height: '350px', overflowY: 'auto' }}>
                                {chatLog.length === 0 && <p className="text-muted small text-center">No messages yet.</p>}
                                {chatLog.map((msg, index) => (
                                    <div key={index} className="mb-2">
                                        <span className="badge bg-secondary me-1">{msg.user}</span>
                                        <span className="text-dark">{msg.message}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="card-footer bg-white">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                                        placeholder="Send a message..."
                                    />
                                    <button className="btn btn-primary" onClick={sendChat}>Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Connecting to game...</p>
                </div>
            )}
        </div>
        </div>
    );
}

export default GameBoard;