import React, { useState, useEffect } from 'react';
import { folderSongs, albums as albumFolders } from '../data/songs';

// Icons
const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 6V18L19 12L7 6Z" fill="#000" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

const HeartIcon = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill={filled ? "#1ED760" : "none"}
            stroke={filled ? "#1ED760" : "white"}
            strokeWidth="2"
        />
    </svg>
);

const MainContent = ({ setSidebarOpen, onAlbumClick, toggleLikeAlbum, likedSongs, onSearch, searchResults, isSearching, onPlayApiSong }) => {
    const [greeting, setGreeting] = useState("Good morning");
    const [albumData, setAlbumData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour >= 12 && currentHour < 18) {
            setGreeting("Good afternoon");
        } else if (currentHour >= 18) {
            setGreeting("Good evening");
        }

        const fetchAlbums = async () => {
            const data = [];
            for (const folder of albumFolders) {
                try {
                    const res = await fetch(`songs/${folder}/info.json`);
                    if (res.ok) {
                        const info = await res.json();
                        data.push({ folder, ...info });
                    } else {
                        data.push({ folder, title: folder, description: "Album" });
                    }
                } catch (error) {
                    // console.error(`Could not load info for ${folder}`, error);
                    data.push({ folder, title: folder, description: "Unknown Album" });
                }
            }
            setAlbumData(data);
        };
        fetchAlbums();
    }, []);

    useEffect(() => {
        if (onSearch) {
            const timer = setTimeout(() => {
                onSearch(searchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, onSearch]);

    const filteredAlbums = albumData.filter(album =>
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAlbumLiked = (folderName) => {
        const songs = folderSongs[folderName];
        if (!songs || songs.length === 0) return false;
        const firstSongPath = `songs/${folderName}/${songs[0]}`;
        return likedSongs.includes(firstSongPath);
    };

    return (
        <div className="right">
            {/* Header */}
            <div className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Mobile Menu Trigger */}
                    <div
                        className="hamburgerContainer"
                        onClick={() => setSidebarOpen(true)}
                        style={{ display: 'none' }}
                    >
                        <style>{`@media(max-width:768px){ .hamburgerContainer{ display:block !important; cursor:pointer;} }`}</style>
                        <img className="invert" src="img/hamburger.svg" alt="Menu" width="24" />
                    </div>

                    <div className="welcome-section">
                        <h1>{greeting}</h1>
                        {!isSearching && <h2>Have a great day listening!</h2>}
                    </div>
                </div>

                <div className="search-wrapper">
                    <div className="search-bar">
                        <img className="invert" src="img/search.svg" alt="Search" />
                        <input
                            type="text"
                            placeholder="What do you want to play?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="main-content-scroll">
                <div className="cards-grid">
                    <h2 className="section-title">{isSearching ? "Search Results" : "Albums For You"}</h2>

                    <div className="card-container">
                        {isSearching ? (
                            searchResults.length > 0 ? (
                                searchResults.map((song) => (
                                    <div
                                        key={song.id}
                                        className="card"
                                        onClick={() => onPlayApiSong(song)}
                                    >
                                        <div className="card-img-wrapper">
                                            <img
                                                src={song.image || 'img/cover.jpg'}
                                                alt={song.name}
                                                onError={(e) => { e.target.src = 'img/cover.jpg'; }}
                                            />
                                            <div className="card-play-btn">
                                                <PlayIcon />
                                            </div>
                                        </div>
                                        <div className="card-title">{song.name}</div>
                                        <div className="card-desc">{song.artist}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No results found for "{searchTerm}"</p>
                            )
                        ) : (
                            filteredAlbums.map((album) => {
                                const liked = isAlbumLiked(album.folder);
                                return (
                                    <div
                                        key={album.folder}
                                        className="card"
                                        onClick={() => onAlbumClick(album.folder)}
                                    >
                                        <div className="card-img-wrapper">
                                            <img
                                                src={`songs/${album.folder}/cover.jpg`}
                                                alt={album.title}
                                                onError={(e) => { e.target.src = 'img/cover.jpg'; }}
                                            />
                                            <div className="card-play-btn">
                                                <PlayIcon />
                                            </div>
                                            {/* Like Button overlaid */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLikeAlbum(album.folder);
                                                }}
                                                className="hover:scale-110 transition-transform"
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    zIndex: 5,
                                                    padding: '6px',
                                                    background: 'rgba(0,0,0,0.4)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <HeartIcon filled={liked} />
                                            </div>
                                        </div>
                                        <div className="card-title">{album.title}</div>
                                        <div className="card-desc">{album.description}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainContent;
