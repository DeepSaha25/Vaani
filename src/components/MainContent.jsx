import React, { useState, useEffect } from 'react';
import { folderSongs, albums as albumFolders } from '../data/songs';

// Icons paths (using relative paths now)
const heartOutlinePath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
const heartFilledPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

const MainContent = ({ setSidebarOpen, onAlbumClick, toggleLikeAlbum, likedSongs, onSearch, searchResults, isSearching, onPlayApiSong }) => {
    const [greeting, setGreeting] = useState("Good morning");
    const [albumData, setAlbumData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Set greeting
        const currentHour = new Date().getHours();
        if (currentHour >= 12 && currentHour < 18) {
            setGreeting("Good afternoon");
        } else if (currentHour >= 18) {
            setGreeting("Good evening");
        }

        // Fetch album info
        const fetchAlbums = async () => {
            const data = [];
            for (const folder of albumFolders) {
                try {
                    const res = await fetch(`songs/${folder}/info.json`);
                    if (res.ok) {
                        const info = await res.json();
                        data.push({ folder, ...info });
                    } else {
                        // Fallback if no info.json
                        data.push({
                            folder,
                            title: folder,
                            description: "Album"
                        });
                    }
                } catch (error) {
                    console.error(`Could not load info for ${folder}`, error);
                    data.push({ folder, title: folder, description: "Unknown Album" });
                }
            }
            setAlbumData(data);
        };

        fetchAlbums();
    }, []);

    // Debounce search for API
    useEffect(() => {
        // We only want to trigger API search if query is non-empty, OR properly handle empty.
        // And we also use searchTerm for local filtering.
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
            <div className="header">
                <div className="nav">
                    <div className="hamburgerContainer" onClick={() => setSidebarOpen(true)}>
                        <img
                            role="button"
                            aria-label="Open sidebar"
                            width="30"
                            className="invert hamburger"
                            src="img/hamburger.svg"
                            alt="Menu"
                        />
                    </div>
                    <div className="welcome">
                        <h1 id="greeting" style={{ fontWeight: 'bold', marginBottom: '10px' }}>{greeting}</h1>
                        <h2>Which one wanna tune today?</h2>
                    </div>
                </div>

                <div className="search-bar" role="search">
                    <img className="invert" src="img/search.svg" alt="Search Icon" />
                    <input
                        type="text"
                        placeholder="Search for songs..."
                        aria-label="Search for songs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="main-content">
                <div className="spotifyPlaylists">
                    <h1>{isSearching ? "Search Results" : "You click it, You tune it!"}</h1>
                    <div className="cardContainer">
                        {isSearching ? (
                            searchResults.length > 0 ? (
                                searchResults.map((song) => (
                                    <div
                                        key={song.id}
                                        className="card"
                                        role="button"
                                        tabIndex="0"
                                        onClick={() => onPlayApiSong(song)}
                                    >
                                        <div className="play">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" strokeWidth="1.5" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <img
                                            src={song.image || 'img/cover.jpg'}
                                            alt={song.name}
                                            onError={(e) => { e.target.src = 'img/cover.jpg'; }}
                                        />
                                        <h2>{song.name}</h2>
                                        <p>{song.artist}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No results found for "{searchTerm}"</p>
                            )
                        ) : (
                            filteredAlbums.map((album) => {
                                const liked = isAlbumLiked(album.folder);
                                return (
                                    <div
                                        key={album.folder}
                                        className="card"
                                        role="button"
                                        tabIndex="0"
                                        onClick={() => onAlbumClick(album.folder)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') onAlbumClick(album.folder);
                                        }}
                                    >
                                        <div className="play">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" strokeWidth="1.5" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div
                                            className={`like-btn ${liked ? 'liked' : ''}`}
                                            role="button"
                                            aria-label="Like album"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLikeAlbum(album.folder);
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d={liked ? heartFilledPath : heartOutlinePath}></path>
                                            </svg>
                                        </div>
                                        <img
                                            src={`songs/${album.folder}/cover.jpg`}
                                            alt={album.title}
                                            onError={(e) => { e.target.src = 'img/cover.jpg'; }}
                                        />
                                        <h2>{album.title}</h2>
                                        <p>{album.description}</p>
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
