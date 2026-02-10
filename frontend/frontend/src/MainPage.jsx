import React, { useState, useEffect, useCallback } from "react";

function MainPage() {
    const [language, setLanguage] = useState("en");
    const [seed, setSeed] = useState(123);
    const [songs, setSongs] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [likes, setLikes] = useState(0);
    const [viewMode, setViewMode] = useState("table");

    const fetchSongs = useCallback(async (isInitial = false) => {
        if (seed === "" || isNaN(seed)) return;

        try {
            const response = await fetch(
                `http://localhost:5055/api/Generator/get-songs?Region=${language}&Seed=${seed}&Page=${page}&Limit=${limit}&Likes=${likes}`
            );
            if (!response.ok) throw new Error("Server error");
            
            const data = await response.json();
            
            if (viewMode === "gallery" && !isInitial) {
                setSongs(prev => [...prev, ...data]);
            } else {
                setSongs(data);
            }
        } catch (error) {
            console.error("Generation failed:", error);
        }
    }, [language, seed, page, limit, likes, viewMode]);

    useEffect(() => {
        fetchSongs(page === 1);
    }, [fetchSongs, page]);

    useEffect(() => {
        setPage(1);
        setSongs([]);
    }, [language, seed, likes, viewMode]);

    useEffect(() => {
        if (viewMode !== "gallery") return;

        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const currentPosition = window.innerHeight + window.scrollY;
            if (currentPosition >= scrollHeight - 500) {
                setPage(prev => prev + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [viewMode]);

    const handleRandomSeed = () => {
        const max64Bit = 9999999999999;
        const randomSeed = Math.floor(Math.random() * max64Bit);
        setSeed(randomSeed);
    };

    const toggleSong = (song) => {
        setSelectedSong(selectedSong?.index === song.index ? null : song);
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleSeedChange = (e) => {
        const val = e.target.value;
        if (val === "") { setSeed(""); return; }
        const newSeed = parseInt(val, 10);
        setSeed(newSeed < 1 ? 1 : newSeed);
    };

    return (
        <div className="container-fluid mt-5 w-75">
            <div className="row mb-3 bg-light p-3 rounded border mx-0 align-items-center">
                <div className="col-md-3">
                    <label className="small fw-bold">Language</label>
                    <select className="form-select" value={language} onChange={handleLanguageChange}>
                        <option value="en">English (US)</option>
                        <option value="ru">Russian</option>
                    </select>
                </div>

                <div className="col-md-3 d-flex align-items-end gap-2">
                    <div className="flex-grow-1">
                        <label className="small fw-bold">Seed</label>
                        <input type="number" className="form-control" value={seed} onChange={handleSeedChange} />
                    </div>
                    <button className="btn btn-outline-secondary" onClick={handleRandomSeed}>
                         🔀
                    </button>
                </div>

                <div className="col-md-4">
                    <label className="small fw-bold">Average Likes: {likes}</label>
                    <input 
                        type="range" 
                        className="form-range" 
                        min="0" max="10" step="0.1" 
                        value={likes} 
                        onChange={(e) => setLikes(parseFloat(e.target.value))} 
                    />
                </div>

                <div className="col-md-2 d-flex justify-content-end">
                    <div className="btn-group">
                        <button 
                            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setViewMode('table')}
                        >
                            Table
                        </button>
                        <button 
                            className={`btn ${viewMode === 'gallery' ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setViewMode('gallery')}
                        >
                            Gallery
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === "table" ? (
                <div className="row mx-0">
                    <table className="table table-striped table-hover border">
                        <thead>
                            <tr><th>#</th><th>Song</th><th>Artist</th><th>Album</th><th>Genre</th></tr>
                        </thead>
                        <tbody>
                            {songs.map((song) => (
                                <React.Fragment key={song.index}>
                                    <tr onClick={() => toggleSong(song)} style={{ cursor: 'pointer' }}>
                                        <td>{song.index}</td>
                                        <td>{song.title}</td>
                                        <td>{song.artist}</td>
                                        <td>{song.album}</td>
                                        <td>{song.genre}</td>
                                    </tr>
                                    {selectedSong?.index === song.index && (
                                        <tr>
                                            <td colSpan="5" className="p-0">
                                                <div className="d-flex bg-light p-4 border-bottom">
                                                    <div className="text-center me-4">
                                                        <img 
                                                            src={`http://localhost:5055${song.coverUrl}`} 
                                                            alt="cover" 
                                                            className="rounded shadow" 
                                                            style={{ width: '200px', height: '200px', objectFit: 'cover' }} 
                                                        />
                                                        <div className="mt-2">
                                                            <span className="badge rounded-pill bg-primary px-3 py-2 shadow-sm">
                                                                <i className="bi bi-hand-thumbs-up-fill me-1"></i>
                                                                {song.likes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h2>{song.title}</h2>
                                                        <p className="text-muted fs-5">
                                                            from <strong>{song.album}</strong> by <strong>{song.artist}</strong>
                                                        </p>
                                                        <audio controls className="w-100 mt-2">
                                                            <source src={`http://localhost:5055${song.audioUrl}`} type="audio/mpeg" />
                                                        </audio>
                                                        <div className="mt-4 p-3 bg-white rounded border shadow-sm">
                                                            <small className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem' }}>Review</small>
                                                            <p className="mt-2 mb-0 fst-italic text-secondary">
                                                                "{song.review || 'This track brings a unique energy to the genre...'}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    <nav>
                        <ul className="pagination d-flex justify-content-center">
                            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                            </li>
                            {(() => {
                                let startPage = Math.max(1, page - 2);
                                return [...Array(5)].map((_, i) => {
                                    const pageNum = startPage + i;
                                    return (
                                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum}</button>
                                        </li>
                                    );
                                });
                            })()}
                            <li className="page-item">
                                <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            ) : (
                <div className="row">
                    {songs.map((song) => (
                        <div className="col-md-4 mb-4" key={song.index}>
                            <div className="card shadow-sm h-100">
                                <img 
                                    src={`http://localhost:5055${song.coverUrl}`} 
                                    className="card-img-top" 
                                    alt="cover" 
                                    style={{ height: '250px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0">{song.title}</h5>
                                        <span className="badge bg-primary">{song.likes}</span>
                                    </div>
                                    <p className="card-text text-muted small mb-1">{song.artist}</p>
                                    <p className="card-text text-secondary x-small">{song.album} • {song.genre}</p>
                                    <audio controls className="w-100 mt-2" style={{ height: '35px' }}>
                                        <source src={`http://localhost:5055${song.audioUrl}`} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MainPage;