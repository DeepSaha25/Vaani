import React, { useEffect, useState } from 'react';
import { albums as albumFolders, folderSongs } from '../data/songs';

const heartOutlinePath = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";
const heartFilledPath = "M12 21.23l-1.06-1.06a5.5 5.5 0 0 1-7.78-7.78l1.06-1.06L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23z";

const MainContent = ({ setSidebarOpen, onAlbumClick, toggleLikeAlbum, likedSongs }) => {
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
                    const res = await fetch(`/songs/${folder}/info.json`);
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

    const filteredAlbums = albumData.filter(album =>
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAlbumLiked = (folderName) => {
        // Check if ALL songs in this album are in likedSongs?
        // Original logic: "if isLiked... add all songs... else remove all songs"
        // The visual state was just toggled on click.
        // Ideally we check if *any* or *all* are liked.
        // Original code: `const isLiked = likeButton.classList.toggle('liked');` - it was purely UI state driven initially, then synced.
        // But `likedSongs` array is the source of truth for playback.
        // Let's rely on whether the songs are in the liked list.
        // Actually, checking if *all* songs are liked is expensive?
        // Let's just track it via a prop or derivation?
        // For simplicity, I'll implementation `isAlbumLiked` by checking if the first song of the album is in likedSongs?
        // No, `toggleLikeAlbum` helps us manage the state.
        // Let's assume passed in `likedSongs` contains full paths `songs/Folder/Song.mp3`.
        // If the album is "liked", maybe we just check if any song from it is there?
        // Or just store "likedAlbums" separately?
        // The PROMPT requirement is to convert, so let's stick to original logic:
        // Original logic: toggle adds/removes ALL songs. 
        // We can check if the first song is present to determine "liked" state for the Heart icon.

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
                            src="/img/hamburger.svg"
                            alt="Menu"
                        />
                    </div>
                    <div className="welcome">
                        <h1 id="greeting" style={{ fontWeight: 'bold', marginBottom: '10px' }}>{greeting}</h1>
                        <h2>Which one wanna tune today?</h2>
                    </div>
                </div>

                <div className="search-bar" role="search">
                    <img className="invert" src="/img/search.svg" alt="Search Icon" />
                    <input
                        type="text"
                        placeholder="Search for albums..."
                        aria-label="Search for albums"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="main-content">
                <div className="spotifyPlaylists">
                    <h1>You click it, You tune it!</h1>
                    <div className="cardContainer">
                        {filteredAlbums.map((album) => {
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
                                        src={`/songs/${album.folder}/cover.jpg`}
                                        alt={album.title}
                                        onError={(e) => { e.target.src = '/img/cover.jpg'; }}
                                    />
                                    <h2>{album.title}</h2>
                                    <p>{album.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainContent;
