import { getTrendingSongs } from './src/api/music.js';

async function verifyFilter() {
    console.log("Fetching trending songs to verify year filter...");
    try {
        const songs = await getTrendingSongs();
        console.log(`Fetched ${songs.length} songs.`);
        
        const oldSongs = songs.filter(s => s.year < 2022);
        
        if (oldSongs.length === 0) {
            console.log("SUCCESS: All songs are from 2022 or later.");
        } else {
            console.error(`FAILURE: Found ${oldSongs.length} songs from before 2022.`);
            oldSongs.forEach(s => console.log(`${s.name} (${s.year})`));
        }

        if (songs.length > 0) {
            console.log("Sample Song Years:");
            songs.slice(0, 5).forEach(s => console.log(`${s.name}: ${s.year}`));
        } else {
            console.warn("WARNING: No songs returned. Filter might be too strict or fetch failed.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

verifyFilter();
