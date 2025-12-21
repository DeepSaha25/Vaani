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
        <div className={`fixed bottom-0 left-0 right-0 h-[84px] glass-header z-50 transition-all duration-500 ease-in-out ${!isReady ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'} backdrop-blur-2xl border-t border-white/10 shadow-2xl`}>

            {/* --- Mobile Layout (< md) --- */}
            {/* --- Mobile Layout (< md) --- */}
            <div className="flex md:hidden flex-col h-full relative">
                {/* Main Row: Grid Layout to prevent overlap */}
                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-4 gap-2 pb-2">

                    {/* 1. Song Info (Left) - Truncates properly */}
                    <div className="min-w-0 pr-2">
                        {currentSong && (
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-white truncate drop-shadow-md">{currentSong.name}</div>
                                <div className="text-xs text-gray-300 truncate">{currentSong.artist}</div>
                            </div>
                        )}
                    </div>

                    {/* 2. Controls (Center) - Fixed width, centered */}
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={toggleShuffle} className="hidden sm:block text-gray-400 hover:text-white transition"><ShuffleIcon active={isShuffle} /></button>
                        <button onClick={onPrev} className="text-gray-300 hover:text-white transition hover:scale-110 active:scale-95">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>
                        <button onClick={onPlayPause} className="bg-white rounded-full p-2.5 text-black hover:scale-110 transition shadow-lg hover:shadow-white/20 active:scale-95">
                            {isPlaying ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>
                        <button onClick={onNext} className="text-gray-300 hover:text-white transition hover:scale-110 active:scale-95">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>
                        <button onClick={toggleLoop} className="hidden sm:block text-gray-400 hover:text-white transition"><LoopIcon mode={loopMode} /></button>
                    </div>

                    {/* 3. Right Side (Shuffle/Loop on small < sm) or Spacer */}
                    <div className="flex justify-end gap-3 sm:hidden">
                        <button onClick={toggleShuffle} className="text-gray-300 active:text-white"><ShuffleIcon active={isShuffle} /></button>
                        <button onClick={toggleLoop} className="text-gray-300 active:text-white"><LoopIcon mode={loopMode} /></button>
                    </div>
                    {/* Spacer for sm+ screens where toggles are in center, to balance Grid */}
                    <div className="hidden sm:block"></div>
                </div>

                {/* Mobile Duration Indicators */}
                <div className="absolute bottom-[6px] left-2 text-[10px] text-gray-400 font-mono pointer-events-none">
                    {formatTime(currentTime)}
                </div>
                <div className="absolute bottom-[6px] right-2 text-[10px] text-gray-400 font-mono pointer-events-none">
                    {formatTime(duration)}
                </div>

                {/* Progress Bar (Absolute Bottom) */}
                <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] w-full bg-white/10 group hover:h-[6px] transition-all duration-300">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime || 0}
                        onChange={(e) => onSeek(e.target.value)}
                        className="absolute bottom-0 left-0 w-full h-[20px] opacity-0 cursor-pointer z-30 translate-y-1/2"
                    />
                </div>
            </div>


            {/* --- Desktop Layout (>= md) --- */}
            <div className="hidden md:flex items-center justify-between h-full px-8">
                {/* 1. Song Info (Left) */}
                <div className="flex items-center gap-4 w-1/3 min-w-[120px]">
                    {currentSong && (
                        <>
                            <div className="relative group/cover">
                                <img
                                    src={currentSong.image || 'img/cover.jpg'}
                                    alt=""
                                    className="w-14 h-14 rounded-md shadow-lg object-cover group-hover/cover:shadow-purple-500/20 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 rounded-md opacity-0 group-hover/cover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-white truncate max-w-[180px] hover:underline cursor-pointer">{currentSong.name}</div>
                                <div className="text-xs text-gray-400 truncate max-w-[180px] hover:text-gray-300 cursor-pointer">{currentSong.artist}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Controls (Center) */}
                <div className="flex flex-col items-center flex-1 max-w-[600px]">
                    {/* Buttons */}
                    <div className="flex items-center gap-6 mb-2">
                        <button onClick={toggleShuffle} className="hover:scale-110 transition text-gray-400 hover:text-white">
                            <ShuffleIcon active={isShuffle} />
                        </button>

                        <button onClick={onPrev} className="hover:text-white text-gray-400 hover:scale-110 transition active:scale-95">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>

                        <button
                            onClick={onPlayPause}
                            className="bg-white rounded-full p-2.5 hover:scale-110 transition active:scale-95 shadow-lg shadow-white/10 hover:shadow-white/30"
                        >
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button onClick={onNext} className="hover:text-white text-gray-400 hover:scale-110 transition active:scale-95">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>

                        <button onClick={toggleLoop} className="hover:scale-110 transition text-gray-400 hover:text-white">
                            <LoopIcon mode={loopMode} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 text-xs text-gray-400 group/progress">
                        <span className="min-w-[35px] text-right font-mono">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer group-hover/progress:h-1.5 transition-all">
                            <div
                                className="absolute top-0 left-0 h-full bg-white rounded-full group-hover/progress:bg-purple-400 transition-colors"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime || 0}
                                onChange={(e) => onSeek(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <span className="min-w-[35px] font-mono">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* 3. Volume / Extra (Right) */}
                <div className="w-1/3 flex justify-end items-center gap-2">
                    <div className="flex items-center gap-3 w-36 group/volume">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        <div className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer hover:h-1.5 transition-all">
                            <div
                                className="absolute top-0 left-0 h-full bg-white rounded-full"
                                style={{ width: `${volume * 100}%` }}
                            ></div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playbar;
