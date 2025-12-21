import React, { useRef, useState } from 'react';

// Icons
const ShuffleIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#a855f7" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
    </svg>
);

const LoopIcon = ({ mode }) => {
    // mode: 'off', 'all', 'one'
    const color = mode !== 'off' ? "#a855f7" : "#b3b3b3";
    return (
        <div className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            {mode === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-black text-[#a855f7]">1</span>
            )}
        </div>
    );
};

const Playbar = ({
    currentSong,
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
    currentTime,
    duration,
    onSeek,
    volume,
    onVolumeChange,
    loopMode,
    toggleLoop,
    isShuffle,
    toggleShuffle
}) => {
    const isReady = !!currentSong;
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    // Format Time 0:00
    const formatTime = (time) => {
        if (!time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-[80px] bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 transition-all ${!isReady ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>

            {/* --- Mobile Layout (< md) --- */}
            <div className="flex md:hidden flex-col h-full relative">
                {/* Main Row: Info + Controls */}
                <div className="flex-1 flex items-center justify-between px-3">
                    {/* Song Info */}
                    <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                        {currentSong && (
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-white truncate">{currentSong.name}</div>
                                <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={toggleShuffle}><ShuffleIcon active={isShuffle} /></button>
                        <button onClick={onPrev} className="text-gray-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>
                        <button onClick={onPlayPause} className="bg-white rounded-full p-2 text-black">
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>
                        <button onClick={onNext} className="text-gray-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>
                        <button onClick={toggleLoop}><LoopIcon mode={loopMode} /></button>
                    </div>
                </div>

                {/* Progress Bar (Absolute Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] w-full bg-gray-800">
                    <div
                        className="h-full bg-white relative group"
                        style={{ width: `${progressPercent}%` }}
                    >
                        {/* Thumb (only visible on seek/interaction if needed, essentially invisible touch target) */}
                    </div>
                    {/* Interaction Area for Seek */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime || 0}
                        onChange={(e) => onSeek(e.target.value)}
                        className="absolute bottom-0 left-0 w-full h-[10px] opacity-0 cursor-pointer z-10 translate-y-1/2"
                    />
                </div>
            </div>


            {/* --- Desktop Layout (>= md) --- */}
            <div className="hidden md:flex items-center justify-between h-full px-4">
                {/* 1. Song Info (Left) */}
                <div className="flex items-center gap-3 w-1/3 min-w-[120px]">
                    {currentSong && (
                        <>
                            <img
                                src={currentSong.image || 'img/cover.jpg'}
                                alt=""
                                className="w-12 h-12 rounded"
                            />
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-white truncate max-w-[150px]">{currentSong.name}</div>
                                <div className="text-xs text-gray-400 truncate max-w-[150px]">{currentSong.artist}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Controls (Center) */}
                <div className="flex flex-col items-center flex-1 max-w-[500px]">
                    {/* Buttons */}
                    <div className="flex items-center gap-6 mb-1">
                        <button onClick={toggleShuffle} className="hover:scale-110 transition">
                            <ShuffleIcon active={isShuffle} />
                        </button>

                        <button onClick={onPrev} className="hover:text-white text-gray-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>

                        <button
                            onClick={onPlayPause}
                            className="bg-white rounded-full p-2 hover:scale-105 transition active:scale-95"
                        >
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button onClick={onNext} className="hover:text-white text-gray-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>

                        <button onClick={toggleLoop} className="hover:scale-110 transition">
                            <LoopIcon mode={loopMode} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-2 text-xs text-gray-400">
                        <span className="min-w-[30px] text-right">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime || 0}
                            onChange={(e) => onSeek(e.target.value)}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-purple-500"
                        />
                        <span className="min-w-[30px]">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* 3. Volume / Extra (Right) */}
                <div className="w-1/3 flex justify-end items-center gap-2">
                    <div className="flex items-center gap-2 w-32">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playbar;
