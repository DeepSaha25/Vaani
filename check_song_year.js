import { getTrendingSongs } from './src/api/music.js';

async function checkYear() {
    console.log("Fetching trending songs to check for year/date...");
    try {
        // We will temporarily modify getTrendingSongs or just call fetch directly to see raw data
        // But since I can't modify the code just for this check without potentially breaking it, 
        // I'll just write a raw fetch here mimicking the API logic.
        
        const response = await fetch("https://jiosavan-api-with-playlist.vercel.app/api/playlists?id=47599074");
        const data = await response.json();
        
        if (data.success && data.data && data.data.songs && data.data.songs.length > 0) {
            const song = data.data.songs[0];
            console.log("Sample Song Data (Keys):", Object.keys(song));
            console.log("Year:", song.year);
            console.log("Release Date:", song.release_date);
            console.log("Play Count:", song.play_count);
            console.log("Label:", song.label);
        } else {
            console.log("Failed to fetch or no songs found.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

checkYear();
