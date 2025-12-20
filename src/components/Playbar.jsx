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
    const seekbarRef = useRef(null);

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleSeek = (e) => {
        if (!duration) return;
        const rect = seekbarRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        // Constrain percent
        const constrainedPercent = Math.max(0, Math.min(100, percent));
        onSeek(constrainedPercent);
    };

    const handleSeekClick = (e) => {
        // Just alias to handleSeek for now, as both click and drag might be needed in future, 
        // but original just had click.
        handleSeek(e);
    };

    const seekPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="playbar">
            <div
                className="seekbar"
                ref={seekbarRef}
                onClick={handleSeekClick}
            >
                <div
                    className="circle"
                    style={{ left: `${seekPercent}%` }}
                ></div>
            </div>
            <div className="abovebar">
                <div className="songinfo">
                    {currentSongName ? decodeURI(currentSongName.replace(".mp3", "")) : "No song playing"}
                </div>
                <div className="songbuttons">
                    <img
                        role="button"
                        aria-label="Previous song"
                        id="previous"
                        className="invert"
                        src="/img/prevsong.svg"
                        alt="Previous"
                        onClick={onPrev}
                    />
                    <img
                        role="button"
                        aria-label={isPlaying ? "Pause song" : "Play song"}
                        id="play"
                        className="invert"
                        src={isPlaying ? "/img/pause.svg" : "/img/play.svg"}
                        alt="Play"
                        onClick={onPlayPause}
                    />
                    <img
                        role="button"
                        aria-label="Next song"
                        id="next"
                        className="invert"
                        src="/img/nextsong.svg"
                        alt="Next"
                        onClick={onNext}
                    />
                </div>
                <div className="timevol">
                    <div className="songtime">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <div className="volume">
                        <img
                            role="button"
                            aria-label="Mute/Unmute"
                            className="invert"
                            src={volume === 0 ? "/img/mute.svg" : "/img/volume.svg"}
                            alt="Volume"
                            onClick={() => onVolumeChange(volume > 0 ? 0 : 1)} // Simple toggle, ideally remember last volume
                        />
                        <div className="range">
                            <input
                                type="range"
                                name="volume"
                                id="volumeControl"
                                min="0"
                                max="100"
                                value={volume * 100}
                                onChange={(e) => onVolumeChange(e.target.value / 100)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playbar;
