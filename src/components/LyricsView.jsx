import React, { useState, useEffect } from 'react';

const LyricsView = ({ currentSong }) => {
    const [lyrics, setLyrics] = useState([]);

    // Mock Lyrics Data Generator
    useEffect(() => {
        if (!currentSong) return;

        // Simulating fetching lyrics
        const generateMockLyrics = () => {
            const lines = [
                "Verse 1",
                `Start the music, feel the beat`,
                `Rhythm moving through your feet`,
                `Every note is like a spark`,
                `Lighting up the endless dark`,
                "",
                "Chorus",
                `This is the sound of ${currentSong.name}`,
                `Echoing across the plain`,
                `Listen close and you will hear`,
                `Melodies for all the years`,
                "",
                "Verse 2",
                `Harmonies that lift us high`,
                `Reaching for the painting sky`,
                `Never let the music end`,
                `It's your lover, it's your friend`
            ];
            // Repeat for longer scroll
            return [...lines, ...lines, ...lines];
        };

        setLyrics(generateMockLyrics());
    }, [currentSong]);

    return (
        <div className="flex flex-col items-center justify-start h-full overflow-y-auto px-8 py-12 text-center no-scrollbar space-y-8 animate-fade-in w-full max-w-2xl mx-auto">
            {lyrics.map((line, i) => (
                <p
                    key={i}
                    className={`text-2xl md:text-3xl font-bold transition-all duration-500 cursor-pointer hover:text-white ${line ? 'text-white/60' : 'h-8'}`}
                >
                    {line}
                </p>
            ))}
            <div className="h-32"></div> {/* Bottom spacer */}
        </div>
    );
};

export default LyricsView;
