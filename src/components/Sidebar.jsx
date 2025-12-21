import React, { useState, useRef, useEffect } from 'react';

// Inline Icons
const HomeIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "#b3b3b3"} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const SearchIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const LibraryIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const HeartIcon = () => (
    <div className="w-6 h-6 mr-3 rounded bg-gradient-to-br from-violet-700 to-fuchsia-300 flex items-center justify-center">
        <svg role="img" height="12" width="12" aria-hidden="true" viewBox="0 0 16 16" fill="white">
            <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-3.626-1.13 4.313 4.313 0 0 0-3.535 3.407 4.278 4.278 0 0 0 .59 3.342l5.77 6.425c.346.386.993.386 1.339 0l5.77-6.425a4.276 4.276 0 0 0 .587-3.342Z"></path>
        </svg>
    </div>
);

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeView, playlists, onCreatePlaylist, onNavigate }) => {
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar Container */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40 w-[240px] md:w-[300px] bg-black p-2 flex flex-col gap-2
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Nav Section */}
                <div className="bg-[#121212] rounded-lg p-5 flex flex-col gap-5">
                    <div className="flex items-center gap-2 px-1 cursor-pointer" onClick={() => onNavigate('home')}>
                        <img src="img/vaanilogo.png" alt="Logo" className="w-8 h-8" />
                        <span className="font-bold text-white text-xl">Vaani</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div
                            className={`flex items-center gap-4 text-sm font-semibold cursor-pointer transition ${activeView === 'home' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}
                            onClick={() => onNavigate('home')}
                        >
                            <HomeIcon active={activeView === 'home'} />
                            <span>Home</span>
                        </div>

                        <div
                            className={`flex items-center gap-4 text-sm font-semibold cursor-pointer transition ${activeView === 'search' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}
                            onClick={() => onNavigate('search')}
                        >
                            <SearchIcon active={activeView === 'search'} />
                            <span>Search</span>
                        </div>
                    </div>
                </div>

                {/* Library Section */}
                <div className="bg-[#121212] rounded-lg flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 px-6 shadow-md flex justify-between items-center text-[#b3b3b3]">
                        <div className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                            <LibraryIcon active={false} />
                            <span className="font-bold text-sm">Your Library</span>
                        </div>
                        <div
                            className="hover:bg-[#2a2a2a] p-1 rounded-full text-white cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCreating(true);
                            }}
                        >
                            <PlusIcon />
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-2 pb-20 scrollbar-hide">
                        {/* Liked Songs Item */}
                        <div
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${activeView === 'liked' ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a] text-[#b3b3b3]'}`}
                            onClick={() => onNavigate('liked')}
                        >
                            <HeartIcon />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">Liked Songs</span>
                                <span className="text-xs">Playlist</span>
                            </div>
                        </div>

                        {/* Reference for new playlist input */}
                        {isCreating && (
                            <div className="flex items-center gap-3 p-2 rounded-md bg-[#282828] mx-0">
                                <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-xl">🎵</div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="bg-transparent text-white text-sm font-semibold w-full outline-none border-b border-purple-500 placeholder-gray-500"
                                    placeholder="Playlist Name"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (e.target.value.trim()) {
                                                onCreatePlaylist(e.target.value.trim());
                                                setIsCreating(false);
                                            }
                                        }
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                    onBlur={() => setIsCreating(false)}
                                />
                            </div>
                        )}

                        {/* Playlists */}
                        {playlists.map(pl => (
                            <div
                                key={pl.id}
                                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${activeView === 'playlist' /* && viewData === pl.id? */ ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a] text-[#b3b3b3]'}`}
                                onClick={() => onNavigate('playlist', pl.id)}
                            >
                                <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-xl">🎵</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-semibold text-white truncate">{pl.name}</span>
                                    <span className="text-xs truncate">Playlist • {pl.songs.length} songs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
