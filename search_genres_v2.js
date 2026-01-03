
const BASE_URL = "https://jiosavan-api-with-playlist.vercel.app/api";

const queries = {
    'Pop': 'English Pop',
    'Rock': 'Classic Rock',
    'Indie': 'Indie India', // or Indie Pop
    'Hip Hop': 'Hip Hop International', 
    'Electronic': 'EDM Hits', 
    'Classical': 'Best of Classical', 
    'Jazz': 'Jazz Classics', 
    'Lo-Fi': 'Lo-Fi Beats'
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
        } else {
            console.log("No playlists found.");
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
