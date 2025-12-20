import React, { useRef } from 'react';

const Playbar = ({
    currentSongName,
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
    currentTime,
    duration,
    onSeek,
    volume,
    onVolumeChange
}) => {

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleSeekChange = (e) => {
        const percent = parseFloat(e.target.value);
        onSeek(percent);
    };

    const seekPercent = duration ? (currentTime / duration) * 100 : 0;

    // Parse Display Name
    let displayName = "No Song Playing";
    let displayArtist = "";

    if (currentSongName) {
        const raw = decodeURI(currentSongName.replace(".mp3", ""));
        if (raw.includes("-")) {
            const parts = raw.split("-");
            displayName = parts[1].trim();
            displayArtist = parts[0].trim();
        } else {
            displayName = raw;
        }
    }

    return (
        <div className="playbar">
            {/* Left: Song Info */}
            <div className="pb-left">
                <div className="pb-cover">
                    <img src="img/cover.jpg" alt="Album Art" />
                </div>
                <div className="pb-info">
                    <div className="pb-title">{displayName}</div>
                    <div className="pb-artist">{displayArtist}</div>
                </div>
            </div>

            {/* Center: Controls & Progress */}
            <div className="pb-center">
                <div className="pb-controls">
                    <img
                        className="btn-control invert"
                        src="img/prevsong.svg"
                        alt="Prev"
                        onClick={onPrev}
                    />

                    <div className="btn-play" onClick={onPlayPause}>
                        <img
                            src={isPlaying ? "img/pause.svg" : "img/play.svg"}
                            alt="Play/Pause"
                            style={{ width: isPlaying ? '14px' : '16px', marginLeft: isPlaying ? '0' : '2px' }}
                        />
                    </div>

                    <img
                        className="btn-control invert"
                        src="img/nextsong.svg"
                        alt="Next"
                        onClick={onNext}
                    />
                </div>

                <div className="progress-container">
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        className="seek-slider"
                        min="0"
                        max="100"
                        step="0.1"
                        value={seekPercent || 0}
                        onChange={handleSeekChange}
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Volume */}
            <div className="pb-right">
                <img className="invert" src="img/volume.svg" alt="Vol" width="18" style={{ opacity: 0.7 }} />
                <input
                    type="range"
                    className="vol-slider"
                    min="0" max="100"
                    value={volume * 100}
                    onChange={(e) => onVolumeChange(e.target.value / 100)}
                />
            </div>

            <style>{`
                @media (max-width: 768px) {
                   .pb-center, .pb-right { display: none; }
                }
            `}</style>

            {/* Mobile Controls */}
            <div className="mobile-controls" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginTop: '8px'
            }}>
                <style>{`
                    .mobile-controls { display: none !important; }
                    @media (max-width: 768px) {
                         .mobile-controls { display: flex !important; }
                    }
                  `}</style>

                <img className="invert" src="img/prevsong.svg" width="24" onClick={onPrev} alt="Prev" />
                <div className="btn-play" onClick={onPlayPause} style={{ width: '40px', height: '40px' }}>
                    <img src={isPlaying ? "img/pause.svg" : "img/play.svg"} width="16" alt="Play" />
                </div>
                <img className="invert" src="img/nextsong.svg" width="24" onClick={onNext} alt="Next" />
            </div>

            {/* Mobile Progress */}
            <div className="mobile-progress" style={{ width: '100%', marginTop: '8px' }}>
                <style>{`
                    .mobile-progress { display: none !important; }
                    @media (max-width: 768px) {
                         .mobile-progress { display: block !important; }
                    }
                 `}</style>
                <input
                    type="range"
                    className="seek-slider"
                    min="0"
                    max="100"
                    step="0.1"
                    value={seekPercent || 0}
                    onChange={handleSeekChange}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
};

export default Playbar;
