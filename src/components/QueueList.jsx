import React from 'react';

const QueueList = ({ queue, currentIndex, onPlay, onRemove }) => {

    // Split queue into "Now Playing" and "Up Next"
    const nowPlaying = queue[currentIndex];
    const upNext = queue.slice(currentIndex + 1);

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto px-6 py-8 animate-fade-in max-w-3xl mx-auto">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Now Playing</h3>
            {nowPlaying && (
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl mb-8 border border-white/10 shadow-lg">
                    <img src={nowPlaying.image || 'img/cover.jpg'} className="w-12 h-12 rounded object-cover animate-pulse-slow" alt="" />
                    <div className="flex-1">
                        <div className="text-purple-400 font-bold text-lg">{nowPlaying.name}</div>
                        <div className="text-white/60 text-sm">{nowPlaying.artist}</div>
                    </div>
                    <div className="text-xs text-purple-400 font-mono animate-bounce">PLAYING</div>
                </div>
            )}

            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Up Next</h3>
            <div className="space-y-2">
                {upNext.length > 0 ? upNext.map((song, i) => (
                    <div
                        key={i}
                        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-white/5"
                        onClick={() => onPlay(song)}
                    >
                        <span className="text-white/40 font-mono w-6 text-right">{i + 1}</span>
                        <img src={song.image || 'img/cover.jpg'} className="w-10 h-10 rounded object-cover opacity-80 group-hover:opacity-100 transition" alt="" />
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate group-hover:text-purple-300 transition">{song.name}</div>
                            <div className="text-white/40 text-sm truncate">{song.artist}</div>
                        </div>
                        {onRemove && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(song.id); }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-2 transition"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        )}
                    </div>
                )) : (
                    <div className="text-center text-white/30 py-12 italic">
                        End of Queue
                    </div>
                )}
            </div>
            <div className="h-32"></div> {/* Bottom spacer */}
        </div>
    );
};

export default QueueList;
