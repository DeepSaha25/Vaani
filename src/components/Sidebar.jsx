// ... (imports)

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
                <div
                    className="close"
                    role="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                >
                    <img className="invert" src="img/close.svg" alt="Close" />
                </div>

                <div className="home bg-grey rounded m-1 p-1">
                    <div className="logo">
                        <img src="img/unnamed-removebg-preview.png" alt="TuneMate Logo" />
                        <p>TuneMate</p>
                    </div>
                    <ul>
                        <li onClick={() => window.location.reload()}>
                            <img className="invert" src="img/home.svg" alt="Home" />Home
                        </li>
                    </ul>
                </div>

                <div className="library bg-grey rounded m-1 p-1">
                    <div className="heading">
                        <img className="invert" src="img/playlist.svg" alt="Your Library" />
                        <h2>Your Library</h2>
                    </div>

                    <div className="library-cards">
                        <div
                            id="likedSongsCard"
                            className="lib-card"
                            role="button"
                            tabIndex="0"
                            onClick={() => {
                                setCurrFolder('Liked Songs');
                                setSidebarOpen(false); // Close sidebar on mobile
                            }}
                        >
                            <div className="lib-info">
                                <h3>Liked Songs</h3>
                                <p>{likedSongs.length} liked tracks</p>
                            </div>
                        </div>

                        {/* Recently Played - static in original, let's keep it static or remove if unused logic */}
                        <div className="lib-card">
                            <div className="lib-info">
                                <h3>Recently Played</h3>
                                <p>Catch your recent vibes</p>
                            </div>
                        </div>
                    </div>

                    <div className="songList">
                        <ul>
                            {songs.length === 0 ? (
                                <li style={{ cursor: 'default', background: 'none', border: 'none' }}>
                                    {/* Message for empty state handled in parent or here? */}
                                    No songs found.
                                </li>
                            ) : (
                                songs.map((song, index) => {
                                    let songDisplayName = "";
                                    let isActive = false;

                                    if (typeof song === 'string') {
                                        songDisplayName = song.replaceAll("%20", " ").replace(".mp3", "");
                                        isActive = currentSongName && decodeURI(currentSongName).includes(songDisplayName);
                                    } else {
                                        // API Song Object
                                        songDisplayName = song.name;
                                        isActive = currentSongName === song.name;
                                    }

                                    return (
                                        <li
                                            key={index}
                                            role="button"
                                            tabIndex="0"
                                            className={isActive ? "active-song" : ""}
                                            onClick={() => handleSongClick(song)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') handleSongClick(song);
                                            }}
                                        >
                                            <img className="invert" width="24" src="img/music.svg" alt="Music icon" />
                                            <div className="info">
                                                <div>{songDisplayName}</div>
                                                {typeof song !== 'string' && <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{song.artist}</div>}
                                            </div>
                                            <div className="playnow">
                                                <span>Play Now</span>
                                                <img width="24" className="invert" src="img/play.svg" alt="Play now" />
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
