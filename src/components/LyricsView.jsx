import React, { useState, useEffect, useRef } from 'react';

const LyricsView = ({ currentSong, currentTime }) => {
    const [lyricsLines, setLyricsLines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSyncedData, setHasSyncedData] = useState(false);
    const activeLineRef = useRef(null);

    // Fetch Lyrics
    useEffect(() => {
        if (!currentSong) return;

        const fetchLyrics = async () => {
            setIsLoading(true);
            setHasSyncedData(false);

            // 1. Try fetching from API
            if (currentSong.id && currentSong.hasLyrics) {
                try {
                    const { getLyrics } = await import('../api/music');
                    const rawLyrics = await getLyrics(currentSong.id);

                    if (rawLyrics) {
                        // Saavn sends HTML usually: "Line 1<br>Line 2..."
                        // Decode HTML entities and visual line breaks
                        const decoded = new DOMParser().parseFromString(rawLyrics, "text/html").body.textContent || "";
                        // Split by <br> tags if they exist in valid HTML, or just newlines
                        // Actually the DOMParser takes strict text. If rawLyrics contains "&lt;br&gt;", it handles it.
                        // But if it contains literal <br>, innerHTML would be better but dangerous.
                        // Let's assume standard text/html cleanup.

                        // Safer: replace <br> with \n before parsing
                        const preProcessed = rawLyrics.replace(/<br\s*\/?>/gi, '\n');
                        const cleanText = new DOMParser().parseFromString(preProcessed, "text/html").body.textContent || "";

                        const lines = cleanText.split('\n').map(line => ({ text: line.trim(), time: -1 })).filter(l => l.text);
                        setLyricsLines(lines);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Lyrics fetch failed", e);
                }
            }

            // 2. Fallback: No lyrics found
            setLyricsLines([{ text: "Lyrics not available for this song.", time: -1 }]);
            setIsLoading(false);
        };

        fetchLyrics();
    }, [currentSong]);

    // Active Index Logic (Only if synced data existed - which we don't support for Saavn yet)
    // For now, we just show strict text.
    const activeIndex = -1;

    return (
        <div className="flex flex-col items-center justify-start h-full overflow-y-auto px-8 py-24 text-center no-scrollbar space-y-6 animate-fade-in w-full max-w-2xl mx-auto scroll-smooth">
            {isLoading ? (
                <div className="text-white/50 animate-pulse mt-20">Loading Lyrics...</div>
            ) : (
                lyricsLines.map((line, i) => (
                    <p
                        key={i}
                        className={`transition-all duration-500 text-lg md:text-2xl font-medium text-white/60 hover:text-white my-2`}
                    >
                        {line.text}
                    </p>
                ))
            )}
            <div className="h-48"></div>
        </div>
    );
};

export default LyricsView;
