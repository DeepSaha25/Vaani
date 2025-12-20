// Using saavn.sumit.co API (Verified working)
const BASE_URL = "https://saavn.sumit.co/api";

const transformSong = (item) => {
    // Helper to extract highest quality image
    const image = item.image && item.image.length > 0 ? item.image[item.image.length - 1].url : null;
    
    // Helper to extract highest quality audio (320kbps preferred)
    const downloadObj = item.downloadUrl ? item.downloadUrl.find(find => find.quality === "320kbps") : null;
    const url = downloadObj ? downloadObj.url : (item.downloadUrl && item.downloadUrl.length > 0 ? item.downloadUrl[item.downloadUrl.length - 1].url : null);

    return {
        id: item.id,
        name: item.name,
        artist: item.artists && item.artists.primary ? item.artists.primary.map(a => a.name).join(", ") : (item.primaryArtists || ""),
        image: image,
        url: url,
        album: item.album ? item.album.name : "Single",
        isApiSong: true
    };
};

export const searchSongs = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (data.data && data.data.results) {
        return data.data.results.map(transformSong);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
};

export const getTrendingSongs = async () => {
    try {
        // Fetching "Top 50" as a proxy for trending/popular songs
        // Alternatively, we could use a specific playlist ID if known, but search is safer generic approach
        const response = await fetch(`${BASE_URL}/search/songs?query=Trending Hindi&limit=20`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
         if (data.data && data.data.results) {
            return data.data.results.map(transformSong);
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch trending songs:", error);
        return [];
    }
};
