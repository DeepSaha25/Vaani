import React from 'react';

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    songs,
    playMusic,
    currentSongName,
    setCurrFolder,
    likedSongs
}) => {

    const handleSongClick = (song) => {
        playMusic(song);
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            <div className={`left ${sidebarOpen ? 'open' : ''}`}>
                {/* Home / Nav Section */}
                <div className="sidebar-box">
                    <div className="logo">
                        <img src="img/unnamed-removebg-preview.png" alt="TuneMate Logo" />
                        <p>TuneMate</p>
                    </div>
                    <div className="nav-item" onClick={() => window.location.reload()}>
                        <img className="invert" src="img/home.svg" alt="Home" />
                        <span>Home</span>
                    </div>
                    <div className="nav-item" onClick={() => {
                        // Focus main search input ideally, for now just close sidebar
                        setSidebarOpen(false);
                    }}>
                        <img className="invert" src="img/search.svg" alt="Search" />
                        <span>Search</span>
                    </div>
                </div>

                {/* Library Section */}
                <div className="sidebar-box library">
                    <div className="library-header">
                        <img className="invert" src="img/playlist.svg" alt="Library" />
                        <span>Your Library</span>
                    </div>

                    <div className="nav-item" onClick={() => {
                        setCurrFolder('Liked Songs');
                        setSidebarOpen(false);
                    }}>
                        <img className="invert" src="img/like.svg" alt="Liked" style={{ width: '20px' }} />
                        <span>Liked Songs</span>
                    </div>

                    <div className="songList">
                        <ul>
                            {songs.length === 0 ? (
                                <li className="song-row" style={{ cursor: 'default' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>No songs here</span>
                                </li>
                            ) : (
                                songs.map((song, index) => {
                                    let songDisplayName = "";
                                    let songArtist = "Unknown Artist";
                                    let isActive = false;

                                    if (typeof song === 'string') {
                                        songDisplayName = song.replaceAll("%20", " ").replace(".mp3", "");
                                        if (songDisplayName.includes("-")) {
                                            const parts = songDisplayName.split("-");
                                            songDisplayName = parts[1].trim();
                                            songArtist = parts[0].trim();
                                        }
                                        isActive = currentSongName && decodeURI(currentSongName).includes(song.replace(".mp3", ""));
                                    } else {
                                        songDisplayName = song.name;
                                        songArtist = song.artist || "Unknown Artist";
                                        isActive = currentSongName === song.name;
                                    }

                                    return (
                                        <li
                                            key={index}
                                            className={`song-row ${isActive ? "active" : ""}`}
                                            onClick={() => handleSongClick(song)}
                                        >
                                            <img
                                                className="invert"
                                                width="16"
                                                src={isActive ? "img/volume.svg" : "img/music.svg"}
                                                alt="Music icon"
                                                style={{ opacity: isActive ? 1 : 0.5 }}
                                            />
                                            <div className="song-info">
                                                <div className="song-title">{songDisplayName}</div>
                                                <div className="song-artist">{songArtist}</div>
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
