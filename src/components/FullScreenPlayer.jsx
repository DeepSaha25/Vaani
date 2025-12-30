import React, { useState, useEffect, useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';
import LyricsView from './LyricsView';
import QueueList from './QueueList';

// Icons
const ChevronDown = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const FullScreenPlayer = ({
    isOpen,
    onClose,
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
    toggleShuffle,
    onDownload,
    isDownloaded,
    audioRef,
    queue,
    onPlayQueueSong, // function to play song from queue
    analyser
}) => {
    const [viewMode, setViewMode] = useState('art'); // 'art', 'lyrics', 'queue'
    const [bgColor, setBgColor] = useState('#121212'); // Default dark
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Extract rudimentary color from image (simple hash or placeholder for now)
    // In a real app, use something like fast-average-color or colorthief
    // For now, we cycle some nice gradients or just keep it dark/purple
    useEffect(() => {
        if (currentSong) {
            // Mock dynamic color logic
            const colors = ['#4c1d95', '#be185d', '#0f766e', '#b45309', '#1e3a8a'];
            const randomColor = colors[currentSong.name.length % colors.length];
            setBgColor(randomColor);
        }
    }, [currentSong]);

    // Swipe Logic
    const minSwipeDistance = 50;
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) onNext();
        if (isRightSwipe) onPrev();
    };

    if (!isOpen) return null;

    // Time Format
    const formatTime = (time) => {
        if (!time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;


    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col bg-black text-white transition-all duration-500 overflow-hidden"
            style={{
                background: `linear-gradient(to bottom, ${bgColor}CC, #000000)`,
            }}
        >
            {/* Background Texture/Blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl z-[-1]"></div>

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-6 py-4 pt-[env(safe-area-inset-top)] z-10 shrink-0">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white">
                    <ChevronDown />
                </button>

                {/* View Toggles */}
                <div className="flex items-center bg-black/20 rounded-full p-1 backdrop-blur-md">
                    <button
                        onClick={() => setViewMode('art')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${viewMode === 'art' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Art
                    </button>
                    <button
                        onClick={() => setViewMode('lyrics')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${viewMode === 'lyrics' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Lyrics
                    </button>
                    <button
                        onClick={() => setViewMode('queue')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${viewMode === 'queue' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        Up Next
                    </button>
                </div>

                <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div
                className="flex-1 relative flex flex-col justify-center overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* 1. ART MODE */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${viewMode === 'art' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                    {/* Visualizer Background Overlay */}
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen scale-y-150 origin-bottom">
                        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                    </div>

                    {/* Album Art */}
                    <div className="relative z-10 w-full max-w-sm aspect-square shadow-2xl rounded-2xl overflow-hidden group">
                        <img
                            src={currentSong?.image || 'img/cover.jpg'}
                            alt={currentSong?.name}
                            className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"></div>
                    </div>

                    {/* Song Info (Large) */}
                    <div className="mt-12 text-center z-10 max-w-md w-full">
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg line-clamp-2">
                            {currentSong?.name}
                        </h1>
                        <p className="text-xl text-white/60 font-medium tracking-wide">
                            {currentSong?.artist}
                        </p>
                    </div>
                </div>

                {/* 2. LYRICS MODE */}
                <div className={`absolute inset-0 transition-opacity duration-500 bg-black/40 backdrop-blur-sm ${viewMode === 'lyrics' ? 'opacity-100 pointer-events-auto z-20' : 'opacity-0 pointer-events-none'}`}>
                    <LyricsView currentSong={currentSong} currentTime={currentTime} />
                </div>

                {/* 3. QUEUE MODE */}
                <div className={`absolute inset-0 transition-opacity duration-500 bg-black/40 backdrop-blur-sm ${viewMode === 'queue' ? 'opacity-100 pointer-events-auto z-20' : 'opacity-0 pointer-events-none'}`}>
                    <QueueList
                        queue={queue}
                        currentIndex={queue.findIndex(s => s.id === currentSong?.id)}
                        onPlay={onPlayQueueSong}
                        onRemove={null} // TODO: Add remove logic
                    />
                </div>
            </div>


            {/* --- PLAYER CONTROLS (ALWAYS VISIBLE) --- */}
            <div className="px-8 pb-10 pt-4 z-30 shrink-0 bg-gradient-to-t from-black via-black/80 to-transparent">

                {/* Progress Bar */}
                <div className="flex flex-col gap-2 mb-8 group/seek">
                    <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all">
                        <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition shadow-lg scale-125"></div>
                        </div>
                        <input
                            type="range"
                            min="0" max={duration || 100}
                            value={currentTime || 0}
                            onChange={(e) => onSeek(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-between text-xs font-mono font-bold text-white/50 tracking-wider">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Main Controls Row */}
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <button onClick={toggleShuffle} className={`p-2 transition active:scale-95 ${isShuffle ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                    </button>

                    <button onClick={onPrev} className="p-3 text-white transition hover:scale-110 active:scale-90 opacity-90 hover:opacity-100">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                    </button>

                    <button
                        onClick={onPlayPause}
                        className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all relative z-10"
                    >
                        {isPlaying ? (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="black"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="black" className="translate-x-1"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>

                    <button onClick={onNext} className="p-3 text-white transition hover:scale-110 active:scale-90 opacity-90 hover:opacity-100">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                    </button>

                    <button onClick={toggleLoop} className={`p-2 transition active:scale-95 relative ${loopMode !== 'off' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                        {loopMode === 'one' && <span className="absolute top-0 right-0 text-[8px] font-black">1</span>}
                    </button>
                </div>

                {/* Bottom Accessories (Download, Heart, Volume) */}
                <div className="flex items-center justify-between mt-10 max-w-lg mx-auto px-4">
                    <button className="text-white/40 hover:text-red-500 transition hover:scale-110">
                        {/* Heart Icon placeholder - can pass isLiked prop later */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>

                    {/* Volume Slider (Compact) */}
                    <div className="flex items-center gap-3 w-32 group/vol">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/60"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                        <div className="relative flex-1 h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all">
                            <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${volume * 100}%` }}></div>
                            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <button onClick={onDownload} className={`transition hover:scale-110 ${isDownloaded ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
                        {isDownloaded ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FullScreenPlayer;
