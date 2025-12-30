import React, { useState, useEffect, useRef } from 'react';

const LyricsView = ({ currentSong, currentTime }) => {
    const [lyricsLines, setLyricsLines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSyncedData, setHasSyncedData] = useState(false);
    const activeLineRef = useRef(null);

    // Helper: Parse LRC format "[mm:ss.xx] lyrics"
    const parseLrc = (lrcText) => {
        const lines = lrcText.split('\n');
        const parsed = [];
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

        for (const line of lines) {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3].padEnd(3, '0')); // Handle 2 or 3 digit ms
                const time = minutes * 60 + seconds + milliseconds / 1000;
                const text = line.replace(timeRegex, '').trim();
                // Filter out metadata tags like [length:...] if text is empty or starts with title/artist tag in content
                if (text && !text.startsWith('length:')) parsed.push({ time, text });
            } else if (line.trim() && !line.startsWith('[') && !line.endsWith(']')) {
                // Fallback for lines without timestamp in mixed content, but avoid strict metadata
                parsed.push({ time: -1, text: line.trim() });
            }
        }
        return parsed;
    };

    // Fetch Lyrics
    useEffect(() => {
        if (!currentSong) return;

        const fetchLyrics = async () => {
            setIsLoading(true);
            setHasSyncedData(false);
            setLyricsLines([]);

            try {
                const { getLyrics } = await import('../api/music');
                // Pass the whole song object now, not just ID
                const result = await getLyrics(currentSong);

                if (result && result.text) {
                    if (result.type === 'lrc') {
                        // LrcLib Synced Lyrics
                        const lrcData = parseLrc(result.text);
                        setLyricsLines(lrcData.length > 0 ? lrcData : [{ text: "Lyrics format not supported.", time: -1 }]);
                        setHasSyncedData(lrcData.length > 0);
                    } else {
                        // Saavn / Plain HTML
                        const rawLyrics = result.text;
                        const preProcessed = rawLyrics.replace(/<br\s*\/?>/gi, '\n');
                        const cleanText = new DOMParser().parseFromString(preProcessed, "text/html").body.textContent || "";
                        const lines = cleanText.split('\n').map(l => ({ text: l.trim(), time: -1 })).filter(l => l.text);
                        setLyricsLines(lines);
                        setHasSyncedData(false);
                    }
                } else {
                    setLyricsLines([{ text: "Lyrics not available for this song.", time: -1 }]);
                }
            } catch (e) {
                console.error("Lyrics fetch failed", e);
                setLyricsLines([{ text: "Error fetching lyrics.", time: -1 }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLyrics();
    }, [currentSong]);

    // Active Index Logic
    const getActiveIndex = () => {
        if (!hasSyncedData || !lyricsLines.length) return -1;
        const index = lyricsLines.findIndex(line => line.time > currentTime);
        if (index === 0) return 0;
        if (index === -1) return lyricsLines.length - 1;
        return index - 1;
    };

    const activeIndex = getActiveIndex();

    // Auto-Scroll
    useEffect(() => {
        if (hasSyncedData && activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex, hasSyncedData]);

    return (
        <div className="flex flex-col items-center justify-start h-full overflow-y-auto px-8 py-24 text-center no-scrollbar space-y-6 animate-fade-in w-full max-w-2xl mx-auto scroll-smooth">
            {isLoading ? (
                <div className="text-white/50 animate-pulse mt-20">Loading Lyrics...</div>
            ) : (
                lyricsLines.map((line, i) => {
                    const isActive = i === activeIndex;
                    // If not synced, show regular text. If synced, highlight active.
                    const isHighlighted = hasSyncedData ? isActive : false;

                    return (
                        <p
                            key={i}
                            ref={isHighlighted ? activeLineRef : null}
                            className={`transition-all duration-500 my-2 cursor-pointer
                            ${hasSyncedData
                                    ? (isHighlighted
                                        ? 'text-2xl md:text-3xl font-bold text-white scale-105 drop-shadow-md py-4'
                                        : 'text-lg md:text-xl text-white/40 hover:text-white/80')
                                    : 'text-lg md:text-2xl font-medium text-white/70 hover:text-white'
                                }
                        `}
                        >
                            {line.text}
                        </p>
                    )
                })
            )}
            <div className="h-48"></div>
        </div>
    );
};

export default LyricsView;
