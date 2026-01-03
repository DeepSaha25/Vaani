
const BASE_URL = "https://jiosavan-api-with-playlist.vercel.app/api";

const queries = {
    'Rock': 'Rock Classics',
    'Indie': 'Indie Pop',
    'Hip Hop': 'Global Hip Hop', 
    'Jazz': 'Best of Jazz', 
    'Lo-Fi': 'Lofi Study'
};

async function search(genre, query) {
    try {
        const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        console.log(`\n--- ${genre} (${query}) ---`);
        if(data.data && data.data.playlists && data.data.playlists.results) {
             data.data.playlists.results.slice(0, 3).forEach(p => {
                 console.log(`- ${p.title} (ID: ${p.id})`);
             });
        }
    } catch (e) {
        console.error(`Error searching ${query}:`, e.message);
    }
}

async function run() {
    for (const [genre, query] of Object.entries(queries)) {
        await search(genre, query);
    }
}

run();
