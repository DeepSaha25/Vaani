
const BASE_URL = "https://jiosavan-api-with-playlist.vercel.app/api";

async function search(query) {
    console.log(`Searching for ${query}...`);
    try {
        const res = await fetch(`${BASE_URL}/search?query=${query}`);
        const data = await res.json();
        if(data.data && data.data.playlists) {
            console.log(`Found playlists for ${query}:`);
             data.data.playlists.results.slice(0, 3).forEach(p => {
                 console.log(`- ${p.title} (ID: ${p.id})`);
             });
        } else {
            console.log("No playlists found in main search results. Trying specific playlist search if available...");
            // Try /search/songs or check if it's nested differently
             console.log("Keys:", Object.keys(data.data || {}));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    await search("Pop");
    await search("Rock");
    await search("Hip Hop");
}

run();
