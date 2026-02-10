import React, {useState} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
function CreatePlayer(){
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const handleName = async(e) =>{
        setName(e.target.value);
    }

    const navigate = useNavigate();
    const handleCreation = async () => {
    if (name.trim() === "") {
        setError("You need to enter your name");
        return;
    }

    try {
        const createPlayer = { Name: name };
        const response = await axios.post("http://localhost:5104/api/Player/create", createPlayer);

        if (response.data.statusCode === 200 || response.data.StatusCode === 200) {
            localStorage.setItem("playerName", name);
            
            const playerId = response.data.data; 
            localStorage.setItem("playerId", playerId);

            console.log("User created with ID:", playerId);
            navigate("/getall");
        } else {
            setError(response.data.message);
        }
    } catch (error) {
        const serverMsg = error.response?.data?.message || "Registration failed.";
        setError(serverMsg);
    }
};
    return(
    <>
      <div className="conatiner-fluid d-flex justify-content-center align-items-center vh-100" style={{
            backgroundImage: `url('https://c8.alamy.com/comp/2GGD3MM/tic-tac-toe-game-texture-hand-drawn-seamless-cross-shapes-pattern-black-elements-on-white-background-2GGD3MM.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat' }}>
        <div className="card p-4 shadow-lg bg-success-subtle text-dark d-flex justify-content-center align-items-center " style={{ width: '25rem', height: '12rem' }}>
            <div className="mb-3 col-12 ">
              <label className="col-form-label mb-2 fw-bold">Enter your Name</label>
              <input type="text" className="form-control" onChange={handleName} value={name} placeholder="Name"/>
            </div>
            <button 
                type="button" 
                className="btn btn-success btn-md w-100 shadow-sm" 
                onClick={handleCreation}
                >Start Game</button>
        </div>
      </div>
    </>);
}
export default CreatePlayer;