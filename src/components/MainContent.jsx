import React, { useState, useEffect } from 'react';

// Icons
const PlayIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#a855f7" />
        <path d="M10 8L16 12L10 16V8Z" fill="#000" />
    </svg>
);

const HeartIcon = ({ filled, onClick }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} className="cursor-pointer hover:scale-110 transition-transform">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
                fill={filled ? "#a855f7" : "none"}
                stroke={filled ? "#a855f7" : "white"}
                strokeWidth="2"
            />
        </svg>
    </div>
);

const TrashIcon = ({ onClick }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} className="cursor-pointer hover:text-red-500 text-gray-400 px-2 py-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
    </div>
);

// Sub-components
const AddToPlaylistMenu = ({ playlists, onAdd, onClose }) => (
    <div className="absolute right-0 bottom-full mb-2 bg-[#282828] p-2 rounded shadow-xl min-w-[160px] z-50 flex flex-col gap-1 max-h-48 overflow-y-auto border border-white/10">
        <div className="text-xs text-gray-400 px-2 pb-1 border-b border-white/10 mb-1 font-bold uppercase tracking-wider">Add to Playlist</div>
        {playlists.length > 0 ? playlists.map(pl => (
            <div
                key={pl.id}
                className="px-2 py-2 hover:bg-white/10 cursor-pointer text-sm rounded bg-[#333] mb-1 last:mb-0 truncate transition"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(pl.id);
                    if (onClose) onClose();
                }}
            >
                {pl.name}
            </div>
        )) : (
            <div className="px-2 py-1 text-xs text-gray-500 italic">No playlists created</div>
        )}
    </div>
);

const SongRow = ({ song, index, isCurrent, onPlay, isLiked, toggleLike, onRemove, playlists, addToPlaylist }) => {
    const [showMenu, setShowMenu] = useState(false);
    return (
        <div
            className={`song-row flex items-center p-2 rounded-md cursor-pointer hover:bg-white/10 ${isCurrent ? 'bg-white/20' : ''}`}
            onClick={() => onPlay()}
            onMouseLeave={() => setShowMenu(false)}
        >
            <span className="w-8 text-center text-gray-400">{index + 1}</span>
            <img src={song.image || 'img/cover.jpg'} alt="" className="w-10 h-10 rounded mr-4 object-cover" />
            <div className="flex-1">
                <div className={`font-medium ${isCurrent ? 'text-purple-400' : 'text-white'}`}>{song.name}</div>
                <div className="text-sm text-gray-400">{song.artist}</div>
            </div>
            <div className="flex items-center gap-4 mr-4 relative">
                <HeartIcon filled={isLiked} onClick={() => toggleLike(song)} />
                {onRemove ? (
                    <TrashIcon onClick={() => onRemove(song)} />
                ) : (
                    <div className="relative" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
                        <div className="p-2 hover:bg-white/10 rounded-full transition">
                            <span className="text-gray-400 hover:text-white text-xl leading-none">⋮</span>
                        </div>
                        {showMenu && (
                            <AddToPlaylistMenu
                                playlists={playlists}
                                onAdd={(id) => { addToPlaylist(id, song); alert("Added to Playlist!"); }}
                                onClose={() => setShowMenu(false)}
                            />
                        )}
                    </div>
                )}
            </div>
            <span className="text-sm text-gray-400 hidden md:block">{song.album || 'Single'}</span>
        </div>
    );
};

const SongCard = ({ song, onPlay, isLiked, toggleLike, addToPlaylist, playlists }) => {
    const [showMenu, setShowMenu] = useState(false);
    return (
        <div
            className="min-w-[150px] w-[150px] md:w-[180px] bg-[#181818] rounded-md p-3 hover:bg-[#282828] transition cursor-pointer group flex flex-col relative"
            onClick={() => onPlay(song, [song])}
            onMouseLeave={() => setShowMenu(false)}
        >
            <div className="mb-3 relative w-full aspect-square">
                <img src={song.image} className="w-full h-full object-cover rounded shadow-lg" alt="" />
                <div className="absolute right-2 bottom-2 bg-purple-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0 text-black">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
            </div>
            <h3 className="font-bold truncate mb-1 text-sm md:text-base">{song.name}</h3>
            <p className="text-xs md:text-sm text-gray-400 truncate">{song.artist}</p>
            <div className="mt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition items-center relative z-10 w-full">
                <HeartIcon filled={isLiked} onClick={() => toggleLike(song)} />
                <div className="relative" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
                    <div className="p-1 hover:bg-white/10 rounded-full transition">
                        <span className="text-gray-400 hover:text-white text-xl px-1">⋮</span>
                    </div>
                    {showMenu && (
                        <AddToPlaylistMenu
                            playlists={playlists}
                            onAdd={(id) => { addToPlaylist(id, song); alert("Added to Playlist!"); }}
                            onClose={() => setShowMenu(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};


const MainContent = ({
    activeView,
    viewData,
    setSidebarOpen,
    searchResults,
    isSearching,
    onSearch,
    playlists,
    likedSongs,
    recentlyPlayed,
    trendingSongs,
    onPlay,
    toggleLike,
    addToPlaylist,
    deletePlaylist,
    currentSong,
    onNavigate
}) => {
    const [greeting, setGreeting] = useState("Good morning");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const h = new Date().getHours();
        if (h >= 12 && h < 18) setGreeting("Good afternoon");
        else if (h >= 18) setGreeting("Good evening");
    }, []);

    // Clear search when navigating to other views
    useEffect(() => {
        if (activeView !== 'search' && searchTerm) {
            setSearchTerm("");
        }
    }, [activeView]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeView === 'search' || searchTerm) {
                onSearch(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);


    const renderHeader = () => (
        <div className="header sticky top-0 z-20 glass-header px-6 py-4 flex justify-between items-center h-[72px] gap-6 transition-all duration-300">
            {/* Mobile Menu Button */}
            <div
                className="md:hidden cursor-pointer p-2 hover:bg-white/10 rounded-full shrink-0 transition"
                onClick={() => setSidebarOpen(true)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
            </div>

            {/* Desktop Nav Arrows (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 cursor-pointer hover:bg-black/60 transition backdrop-blur-sm" onClick={() => window.history.back()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 cursor-pointer hover:bg-black/60 transition backdrop-blur-sm" onClick={() => window.history.forward()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-[480px] group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                    type="text"
                    placeholder="What do you want to play?"
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white rounded-full pl-10 pr-4 py-3 text-sm outline-none border border-transparent focus:border-white/20 transition-all placeholder-gray-400 backdrop-blur-sm shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                        if (searchTerm) onSearch(searchTerm);
                    }}
                />
            </div>

            <div className="w-8 md:w-0"></div>
        </div>
    );

    const renderContent = () => {
        // --- SEARCH VIEW ---
        if (activeView === 'search') {
            return (
                <div className="p-4 md:p-8 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 text-white/90">Top Results</h2>
                    {searchResults.length === 0 && !isSearching ? (
                        <div className="text-gray-400 text-lg">Type to search for songs, artists, or albums...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {searchResults.map(song => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    isLiked={likedSongs.some(s => s.id === song.id)}
                                    toggleLike={toggleLike}
                                    addToPlaylist={addToPlaylist}
                                    playlists={playlists}
                                    onPlay={onPlay}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // --- LIKED / PLAYLIST VIEW ---
        if (activeView === 'liked' || activeView === 'playlist') {
            let title = "Liked Songs";
            let songs = likedSongs;
            let playlistId = null;

            if (activeView === 'playlist') {
                const pl = playlists.find(p => p.id === viewData);
                title = pl?.name || "Playlist";
                songs = pl?.songs || [];
                playlistId = pl?.id;
            }

            return (
                <div className="p-6 pt-0 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-end gap-8 mb-8 pt-10 bg-gradient-to-b from-indigo-900/60 to-transparent p-8 rounded-b-2xl -mx-6 shadow-lg backdrop-blur-3xl border-b border-white/5">
                        <div className="w-52 h-52 bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-2xl flex items-center justify-center text-8xl rounded-2xl mx-auto md:mx-0 transform hover:scale-105 transition duration-500">
                            {activeView === 'liked' ? '❤️' : '🎵'}
                        </div>
                        <div className="text-center md:text-left">
                            <p className="uppercase text-xs font-bold tracking-widest mb-2 text-white/70">Playlist</p>
                            <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-2xl">{title}</h1>
                            <p className="text-gray-300 text-sm font-medium opacity-80">{songs.length} songs</p>
                        </div>
                    </div>

                    <div className="min-h-[300px] bg-black/20 backdrop-blur-sm -mx-6 px-8 py-6 rounded-3xl mt-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-14 h-14 bg-[#a855f7] rounded-full flex items-center justify-center hover:scale-110 hover:bg-[#b06bf7] transition-all cursor-pointer shadow-lg shadow-purple-900/50 text-black active:scale-95" onClick={() => songs.length && onPlay(songs[0], songs)}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                            {activeView === 'playlist' && (
                                <button
                                    className="text-gray-400 hover:text-red-400 text-sm font-bold tracking-wider uppercase transition-colors px-4 py-2 hover:bg-white/5 rounded-full"
                                    onClick={() => { if (confirm("Delete playlist?")) deletePlaylist(playlistId); }}
                                >
                                    Delete Playlist
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            {songs.map((song, i) => (
                                <SongRow
                                    key={song.id || i}
                                    song={song}
                                    index={i}
                                    isCurrent={currentSong?.id === song.id}
                                    onPlay={() => onPlay(songs[i], songs)}
                                    isLiked={likedSongs.some(s => s.id === song.id)}
                                    toggleLike={toggleLike}
                                    onRemove={activeView === 'playlist' ? (s) => { /* remove logic via App */ } : null}
                                    playlists={playlists}
                                    addToPlaylist={addToPlaylist}
                                />
                            ))}
                            {songs.length === 0 && <p className="text-gray-500 italic mt-12 text-center text-lg">It's a bit empty here...</p>}
                        </div>
                    </div>
                </div>
            );
        }

        // --- HOME VIEW (UPDATED) ---
        return (
            <div className="p-6 md:p-8 space-y-10 animate-fade-in">
                {/* Greetings */}
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-gradient drop-shadow-lg">{greeting}</h2>

                {/* CASE 1: New User (No History) -> Show Trending as MAIN GRID to fill space */}
                {!recentlyPlayed.length && (
                    <div className="flex-1 animate-slide-up">
                        <h2 className="text-2xl font-bold mb-6 text-white/90">Trending Now</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {trendingSongs.length > 0 ? trendingSongs.map((song, i) => (
                                <SongCard
                                    key={song.id || i}
                                    song={song}
                                    isLiked={likedSongs.some(s => s.id === song.id)}
                                    toggleLike={toggleLike}
                                    addToPlaylist={addToPlaylist}
                                    playlists={playlists}
                                    onPlay={onPlay}
                                />
                            )) : (
                                // Loading Skeletons
                                Array(10).fill(0).map((_, i) => (
                                    <div key={i} className="min-w-[150px] aspect-square bg-white/5 animate-pulse rounded-xl"></div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* CASE 2: Returning User (Has History) -> Show Sections */}
                {recentlyPlayed.length > 0 && (
                    <>
                        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <h2 className="text-2xl font-bold mb-6 text-white/90">Recently Played</h2>
                            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                                {recentlyPlayed.slice(0, 10).map((song, i) => (
                                    <SongCard
                                        key={i}
                                        song={song}
                                        isLiked={likedSongs.some(s => s.id === song.id)}
                                        toggleLike={toggleLike}
                                        addToPlaylist={addToPlaylist}
                                        playlists={playlists}
                                        onPlay={onPlay}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <h2 className="text-2xl font-bold mb-6 text-white/90">Trending Now</h2>
                            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                                {trendingSongs.length > 0 ? trendingSongs.map((song, i) => (
                                    <SongCard
                                        key={song.id || i}
                                        song={song}
                                        isLiked={likedSongs.some(s => s.id === song.id)}
                                        toggleLike={toggleLike}
                                        addToPlaylist={addToPlaylist}
                                        playlists={playlists}
                                        onPlay={onPlay}
                                    />
                                )) : (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="min-w-[180px] h-[240px] bg-white/5 animate-pulse rounded-xl"></div>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}

                {/* 3. Shortcuts (Liked & Playlists) - Always visible, but maybe styled differently? */}
                <section className={`animate-slide-up ${!recentlyPlayed.length ? "mt-12" : ""}`} style={{ animationDelay: '300ms' }}>
                    <h2 className="text-2xl font-bold mb-6 text-white/90">Your Library</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                            className="bg-gradient-to-br from-indigo-900 to-purple-900/80 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden flex items-center gap-5 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-28 relative group p-5"
                            onClick={() => onNavigate('liked')}
                        >
                            <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-full shadow-lg group-hover:bg-white/20 transition">
                                <span className="text-3xl filter drop-shadow">❤️</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-white tracking-wide">Liked Songs</span>
                                <span className="text-sm text-indigo-200 font-medium">{likedSongs.length} songs</span>
                            </div>
                        </div>

                        {playlists.map(pl => (
                            <div
                                key={pl.id}
                                className="bg-[#1e1e1e]/80 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden flex items-center gap-5 cursor-pointer hover:bg-[#2a2a2a] hover:scale-[1.02] hover:shadow-xl transition-all duration-300 h-28 group relative p-5"
                                onClick={() => onNavigate('playlist', pl.id)}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-3xl text-gray-400 shadow-inner group-hover:scale-105 transition">🎵</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-lg truncate text-gray-100">{pl.name}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Playlist</span>
                                </div>
                                <div className="absolute right-4 bg-[#a855f7] rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all shadow-lg translate-y-2 group-hover:translate-y-0 hover:bg-[#b06bf7] active:scale-95 text-black">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    };

    return (
        <div className="right flex flex-col h-full bg-transparent text-white overflow-hidden flex-1 relative">
            {renderHeader()}
            <div className="flex-1 overflow-y-auto main-content-scroll pb-24 scroll-smooth">
                {renderContent()}
            </div>
        </div>
    );
};

export default MainContent;
