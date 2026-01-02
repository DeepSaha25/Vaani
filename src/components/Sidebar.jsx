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

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeView, viewData, playlists, onCreatePlaylist, onNavigate, isPlaybarVisible }) => {
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
            {/* Sidebar Container */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-[60] w-[280px] md:w-[300px] h-full md:h-auto glass-panel p-2 pt-[calc(1rem+env(safe-area-inset-top))] flex flex-col gap-2 rounded-r-xl md:rounded-xl m-0 md:m-2
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                pb-[calc(100px+env(safe-area-inset-bottom))] md:pb-2
                short-viewport-pb
            `}>
                {/* Nav Section */}
                <div className="bg-transparent p-5 flex flex-col gap-5">
                    <div className="flex items-center gap-2 px-1 cursor-pointer group" onClick={() => onNavigate('home')}>
                        <img src="img/vaanilogo.png" alt="Logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-white text-xl tracking-tight">Vaani</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div
                            className={`flex items-center gap-4 text-sm font-semibold cursor-pointer transition p-2 rounded-md ${activeView === 'home' ? 'bg-white/10 text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'}`}
                            onClick={() => onNavigate('home')}
                        >
                            <HomeIcon active={activeView === 'home'} />
                            <span>Home</span>
                        </div>

                        <div
                            className={`flex items-center gap-4 text-sm font-semibold cursor-pointer transition p-2 rounded-md ${activeView === 'search' ? 'bg-white/10 text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'}`}
                            onClick={() => onNavigate('search')}
                        >
                            <SearchIcon active={activeView === 'search'} />
                            <span>Search</span>
                        </div>

                        <div
                            className={`flex items-center gap-4 text-sm font-semibold cursor-pointer transition p-2 rounded-md ${activeView === 'genres' ? 'bg-white/10 text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'}`}
                            onClick={() => onNavigate('genres')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeView === 'genres' ? "#fff" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            <span>Browse</span>
                        </div>
                    </div>
                </div>

                {/* Library Section */}
                <div className="bg-black/20 rounded-lg flex-1 overflow-hidden flex flex-col mx-2 mb-2 min-h-0">
                    <div className="p-4 px-6 shadow-sm flex justify-between items-center text-[#b3b3b3]">
                        <div className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                            <LibraryIcon active={false} />
                            <span className="font-bold text-sm">Your Library</span>
                        </div>
                        <div
                            className="hover:bg-white/10 p-1 rounded-full text-white cursor-pointer transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCreating(true);
                            }}
                        >
                            <PlusIcon />
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide min-h-0">
                        {/* Liked Songs Item */}
                        <div
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition mb-1 ${activeView === 'liked' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[#b3b3b3]'}`}
                            onClick={() => onNavigate('liked')}
                        >
                            <HeartIcon />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">Liked Songs</span>
                                <span className="text-xs">Playlist</span>
                            </div>
                        </div>

                        {/* Downloads Item */}
                        <div
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition mb-1 ${activeView === 'downloads' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[#b3b3b3]'}`}
                            onClick={() => onNavigate('downloads')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeView === 'downloads' ? '#fff' : '#b3b3b3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">Downloads</span>
                            </div>
                        </div>

                        {/* AI Playlist Item */}
                        <div
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:text-white group`}
                            onClick={() => onNavigate('ai_playlist')}
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg className="text-purple-400 group-hover:text-white transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.5 12"></path><path d="M12 12l4.5-8"></path></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">Magic Playlist</span>
                                <span className="text-xs text-gray-400 group-hover:text-gray-200">Ask AI</span>
                            </div>
                        </div>

                        {/* Reference for new playlist input */}
                        {/* Reference for new playlist input */}
                        {isCreating && (
                            <div className="flex items-center gap-2 p-2 rounded-md bg-white/5 mx-0 mb-1 border border-purple-500/50">
                                <div className="w-8 h-8 flex items-center justify-center text-lg">🎵</div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="bg-transparent text-white text-sm font-semibold flex-1 min-w-0 outline-none placeholder-gray-500"
                                    placeholder="Name"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (e.target.value.trim()) {
                                                onCreatePlaylist(e.target.value.trim());
                                                setIsCreating(false);
                                            }
                                        }
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                />
                                <div className="flex gap-1">
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent blur
                                            if (inputRef.current && inputRef.current.value.trim()) {
                                                onCreatePlaylist(inputRef.current.value.trim());
                                                setIsCreating(false);
                                            }
                                        }}
                                        className="p-1.5 hover:bg-white/20 rounded-full text-green-400 transition"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </button>
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setIsCreating(false);
                                        }}
                                        className="p-1.5 hover:bg-white/20 rounded-full text-red-400 transition"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Playlists */}
                        {playlists.map(pl => (
                            <div
                                key={pl.id}
                                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition mb-1 ${activeView === 'playlist' && viewData === pl.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[#b3b3b3]'}`}
                                onClick={() => onNavigate('playlist', pl.id)}
                            >
                                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-xl shadow-sm">🎵</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-semibold text-white truncate">{pl.name}</span>
                                    <span className="text-xs truncate">Playlist • {pl.songs.length} songs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-2 pb-3 md:pb-0 text-[15px] text-[#b3b3b3] text-center opacity-80 font-medium tracking-wide short-viewport-hidden">
                    &copy; Vaani || By Deep Saha
                </div>
            </div >
        </>
    );
};

export default Sidebar;
