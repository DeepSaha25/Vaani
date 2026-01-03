
const BASE_URL = "https://jiosavan-api-with-playlist.vercel.app/api";

const genres = ['Pop', 'Rock', 'Indie', 'Hip Hop', 'Electronic', 'Classical', 'Jazz', 'Lo-Fi'];

async function search(query) {
    try {
        const res = await fetch(`${BASE_URL}/search/playlists?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if(data.data && data.data.results) {
            console.log(`\n--- ${query} ---`);
             data.data.results.slice(0, 3).forEach(p => {
                 console.log(`- ${p.title} (ID: ${p.id})`);
             });
        } else {
            console.log(`\n--- ${query} (No results) ---`);
        }
    } catch (e) {
        console.error(`Error searching ${query}:`, e.message);
    }
}

async function run() {
    for (const g of genres) {
        await search(g);
    }
}

run();
