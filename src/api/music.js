// New API Endpoint (Tested & Verified)
const BASE_URL = "https://jiosavan-api-with-playlist.vercel.app/api";

const transformSong = (item) => {
    // Helper to extract highest quality image (500x500 preferred)
    // API returns array: [{quality: "12kbps", url: "..."}, ...]
    // We want the last one usually, or find by quality.
    // Images: [{quality: "50x50"}, {quality: "150x150"}, {quality: "500x500"}]
    let image = null;
    if (item.image && Array.isArray(item.image) && item.image.length > 0) {
        // Find 500x500 explicitly, or fall back to last (usually highest)
        const highQuality = item.image.find(img => img.quality === "500x500");
        image = highQuality ? highQuality.url : item.image[item.image.length - 1].url;
    } else if (typeof item.image === 'string') {
        image = item.image;
    }

    // Helper to extract highest quality audio (320kbps preferred)
    let url = null;
    if (item.downloadUrl && Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
        const bestQuality = item.downloadUrl.find(find => find.quality === "320kbps");
        url = bestQuality ? bestQuality.url : item.downloadUrl[item.downloadUrl.length - 1].url;
    }

    // Artists: { primary: [{name: "A"}, {name: "B"}], ... }
    let artistNames = "";
    if (item.artists && item.artists.primary) {
        artistNames = item.artists.primary.map(a => a.name).join(", ");
    } else if (item.primaryArtists) {
        artistNames = item.primaryArtists; // Sometimes string or different format
    }

    return {
        id: item.id,
        name: item.name || item.title,
        artist: artistNames,
        image: image,
        url: url,
        album: item.album ? item.album.name : "Single",
        duration: item.duration,
        isApiSong: true
    };
};

const fetchSongDetails = async (ids) => {
    try {
        if (!ids || ids.length === 0) return [];
        const response = await fetch(`${BASE_URL}/songs?ids=${ids.join(',')}`);
        if (!response.ok) return [];
        const data = await response.json();
        if (data.success && data.data) {
            return data.data.map(transformSong);
        }
        return [];
    } catch (e) {
        console.error("Error fetching details:", e);
        return [];
    }
};

const fetchAlbumDetails = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/albums?id=${id}`);
        if (!response.ok) return [];
        const data = await response.json();
        if (data.success && data.data && data.data.songs) {
            return data.data.songs.map(transformSong);
        }
        return [];
    } catch (e) {
        console.error("Error fetching album details:", e);
        return [];
    }
};

const fetchArtistSongs = async (id) => {
    try {
        // Fetch top songs (count=40 to get a comprehensive playlist)
        const response = await fetch(`${BASE_URL}/artists?id=${id}&page=1&count=40`);
        if (!response.ok) return [];
        const data = await response.json();
        if (data.success && data.data && data.data.topSongs) {
            return data.data.topSongs.map(transformSong);
        }
        return [];
    } catch (e) {
        console.error("Error fetching artist songs:", e);
        return [];
    }
};

export const searchSongs = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (!data.success || !data.data) return [];
    
    const { topQuery, albums, artists, songs } = data.data;
    const normalizedQuery = query.toLowerCase().trim();

    // Priority 1: Exact Album Match (For queries like "Dhurandhar", "Animal", "Rockstar")
    if (albums && albums.results && albums.results.length > 0) {
        const exactAlbum = albums.results.find(a => a.title.toLowerCase() === normalizedQuery);
        if (exactAlbum) {
            console.log(`Found exact album match: ${exactAlbum.title}`);
            return await fetchAlbumDetails(exactAlbum.id);
        }
    }

    // Priority 2: Top Query Match (API's best guess)
    if (topQuery && topQuery.results && topQuery.results.length > 0) {
        const topResult = topQuery.results[0];
        if (topResult.type === 'album') {
             return await fetchAlbumDetails(topResult.id);
        }
        if (topResult.type === 'artist') {
             return await fetchArtistSongs(topResult.id);
        }
    }
    
    // Priority 3: Fallback to Songs (Default behavior)
    if (songs && songs.results && songs.results.length > 0) {
        const ids = songs.results.map(s => s.id);
        return await fetchSongDetails(ids);
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
};

export const getTrendingSongs = async () => {
    try {
        // Fetch "Now Trending" Playlist (ID: 47599074)
        // This provides proper trending songs with full details (no 2-step needed)
        const response = await fetch(`${BASE_URL}/playlists?id=47599074`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        // Playlist endpoint structure: data.data.songs = [ { ... }, ... ]
        if (data.success && data.data && data.data.songs) {
            return data.data.songs.map(transformSong);
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch trending songs:", error);
        return [];
    }
};
