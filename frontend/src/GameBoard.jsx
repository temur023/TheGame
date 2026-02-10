import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function GameBoard() {
    const { matchId } = useParams();
    const [match, setMatch] = useState(null);
    const [connection, setConnection] = useState(null);
    const connectionRef = useRef(null); // Keep track of connection preventing duplicates

    useEffect(() => {
        // 1. Fetch Initial Data
        const fetchInitialData = async () => {
            try {
                const res = await axios.get("http://localhost:5104/api/Match/get-all");
                const currentMatch = res.data.data.find(m => m.id === parseInt(matchId));
                if (currentMatch) setMatch(currentMatch);
            } catch (err) {
                console.error("Initial load failed:", err);
            }
        };
        fetchInitialData();

        // 2. Initialize SignalR (Only if not already active)
        if (!connectionRef.current) {
            const newConnection = new HubConnectionBuilder()
                .withUrl("http://localhost:5104/gamehub")
                .withAutomaticReconnect()
                .build();

            connectionRef.current = newConnection; // Save ref immediately

            newConnection.start()
                .then(() => {
                    console.log("Connected to SignalR");
                    newConnection.invoke("JoinGame", parseInt(matchId));
                    setConnection(newConnection); // Update state to trigger re-renders

                    newConnection.on("ReceiveUpdate", (updatedMatch) => {
                        console.log("Received move:", updatedMatch);
                        setMatch(updatedMatch);
                    });
                })
                .catch(e => console.error("Connection failed: ", e));
        }

        // Cleanup: Stop connection when leaving page
        return () => {
            if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [matchId]);

    const handleSquareClick = async (index) => {
        const playerId = localStorage.getItem("playerId");
        
        // Ensure connection is valid before sending
        if (connection && connection.state === HubConnectionState.Connected) {
            try {
                await connection.invoke("SendMove", parseInt(playerId), parseInt(matchId), index);
            } catch (err) {
                console.error("Move failed: ", err);
            }
        } else {
            console.warn("Connection not ready. State:", connection?.state);
        }
    };

    return (
        <div className="container mt-5 text-center">
            <h2>Match ID: {matchId}</h2>
            {match ? (
                <div className="d-flex flex-column align-items-center">
                    <div className="mb-2">
                         Turn: <span className="fw-bold text-primary">{match.currentPlayerName}</span>
                    </div>
                    <div className="tic-tac-toe-grid">
                        {match.boardState.split(',').map((cell, i) => (
                            <button key={i} className="square-btn" onClick={() => handleSquareClick(i)}>
                                {cell === "X" && <span className="text-primary">X</span>}
                                {cell === "O" && <span className="text-danger">O</span>}
                            </button>
                        ))}
                    </div>
                </div>
            ) : <div className="spinner-border text-primary mt-5"></div>}
        </div>
    );
}

export default GameBoard;