import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreatePlayer() {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const api_url = "https://thegame-production-9b97.up.railway.app"

    useEffect(() => {
        const existingId = localStorage.getItem("playerId");

        if (existingId && existingId !== "undefined" && existingId !== "null") {
            navigate("/getall");
        }
    }, [navigate]);

    const handleName = (e) => {
        setName(e.target.value);
    };

    const handleCreation = async () => {
        if (name.trim() === "") {
            setError("You need to enter your name");
            return;
        }

        try {
            const createPlayer = { Name: name };
            const response = await axios.post("htpps://thegame-production-9b97.up.railway.app/api/Player/create", createPlayer);
            const data = response.data;
            if (data.statusCode === 200 || data.StatusCode === 200) {
                localStorage.setItem("playerName", name);
                localStorage.setItem("playerId", data.data);

                console.log("User created with ID:", data.data, " Name: ", name);
                navigate("/getall");
            } else {
                setError(data.message || "Something went wrong");
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message || "Registration failed.";
            setError(serverMsg);
        }
    };

    return (
        <div className="container-fluid d-flex justify-content-center align-items-center vh-100" style={{
            backgroundImage: `url('https://c8.alamy.com/comp/2GGD3MM/tic-tac-toe-game-texture-hand-drawn-seamless-cross-shapes-pattern-black-elements-on-white-background-2GGD3MM.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <div className="card p-4 shadow-lg bg-success-subtle text-dark" style={{ width: '25rem' }}>
                <div className="mb-3 col-12">
                    <label className="col-form-label mb-2 fw-bold">Enter your Name</label>
                    <input type="text" className="form-control" onChange={handleName} value={name} placeholder="Name" />
                    {error && <div className="text-danger mt-2 small">{error}</div>}
                </div>
                <button type="button" className="btn btn-success btn-md w-100 shadow-sm" onClick={handleCreation}>
                    Start Game
                </button>
            </div>
        </div>
    );
}

export default CreatePlayer;