import React, { useState, useEffect } from 'react';

const LyricsView = ({ currentSong, currentTime }) => {
    const [lyrics, setLyrics] = useState([]);
    const activeLineRef = useRef(null);

    // Mock Lyrics Data Generator (Hinglish with Timestamps)
    useEffect(() => {
        if (!currentSong) return;

        // Simulating fetching lyrics with timestamps
        const generateMockLyrics = () => {
            // Mock Hinglish Lyrics
            const lines = [
                { time: 0, text: "Play the music, feel the vibe" },
                { time: 4, text: "Dil ki dhadkan tez hui hai aaj" },
                { time: 8, text: "Raat ki rani, sapno ka raaj" },
                { time: 12, text: "Masti mein jhoom le hum saath" },
                { time: 16, text: "Bhool ja saare gam, pakad le haath" },
                { time: 20, text: "" }, // Instrumental break
                { time: 22, text: "Chorus" },
                { time: 24, text: `Ye hai kahani ${currentSong.name} ki` },
                { time: 28, text: "Har pal mein hai khushi nayi si" },
                { time: 32, text: "Suno dhyaan se, kya kehti hawa" },
                { time: 36, text: "Jaadu hai ismein, sabse juda" },
                { time: 40, text: "" },
                { time: 42, text: "Verse 2" },
                { time: 44, text: "Aasman ko chhu lein hum aaj" },
                { time: 48, text: "Udne ki chahat, dil mein hai saaz" },
                { time: 52, text: "Rukna nahi hai, badhte chalo" },
                { time: 56, text: "Jeet lenge duniya, bas saath chalo" },
                { time: 60, text: "Tere bina hai sab adhoora yahan" },
                { time: 64, text: "Tu hi hai manzil, tu hi jahan" },
                { time: 68, text: "Muskurahat teri, roshni meri" },
                { time: 72, text: "Har dua mein shamil hai tu hi" },
                { time: 78, text: "" },
                { time: 80, text: "Outro" },
                { time: 82, text: "Dheere se khatam ho raha hai yeh pal" },
                { time: 86, text: "Yaadein bachengi, aane wala kal" }
            ];

            // Just repeat a bit to cover longer songs roughly
            const extended = [...lines,
            { time: 90, text: "Instrumental..." },
            { time: 100, text: "Dil ki dhadkan tez hui hai aaj (Reprise)" },
            { time: 105, text: "Ye hai kahani..." }
            ];

            return extended;
        };

        setLyrics(generateMockLyrics());
    }, [currentSong]);

    // Find Active Index
    // We want the last line that has a time <= currentTime
    const getActiveIndex = () => {
        if (!lyrics.length) return -1;
        // Find the index where the NEXT line's time is greater than currentTime
        // So the current line is index - 1
        const index = lyrics.findIndex(line => line.time > currentTime);
        if (index === 0) return 0; // Should rarely happen if first line is 0
        if (index === -1) return lyrics.length - 1; // Passed all lines
        return index - 1;
    };

    const activeIndex = getActiveIndex();

    // Auto-Scroll Logic
    useEffect(() => {
        if (activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex]);

    return (
        <div className="flex flex-col items-center justify-start h-full overflow-y-auto px-8 py-24 text-center no-scrollbar space-y-6 animate-fade-in w-full max-w-2xl mx-auto scroll-smooth">
            {lyrics.map((line, i) => {
                const isActive = i === activeIndex;
                return (
                    <p
                        key={i}
                        ref={isActive ? activeLineRef : null}
                        className={`transition-all duration-500 cursor-pointer hover:text-white 
                            ${isActive
                                ? 'text-2xl md:text-4xl font-bold text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] my-4'
                                : 'text-lg md:text-2xl font-medium text-white/30 hover:text-white/60'
                            }
                            ${!line.text ? 'h-8' : ''}
                        `}
                        onClick={() => {
                            // Optional: Seek to this line (need onSeek prop if we want to support this)
                        }}
                    >
                        {line.text}
                    </p>
                );
            })}
            <div className="h-48"></div> {/* Large Bottom spacer for offset */}
        </div>
    );
};

export default LyricsView;
