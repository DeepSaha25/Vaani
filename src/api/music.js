export const searchSongs = async (query) => {
  try {
    const response = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // The structure based on my test was data.data.results
    // However, sometimes it is directly data.results depending on the specific fork.
    // Based on curl output: {"data":{"results":[...]}}
    
    if (data.data && data.data.results) {
        return data.data.results.map(item => {
            // Find highest quality image
            const image = item.image && item.image.length > 0 ? item.image[item.image.length - 1].url : null;
            
            // Find 320kbps or highest quality download url
            // downloadUrl is array of { quality, url }
            const downloadObj = item.downloadUrl ? item.downloadUrl.find(find => find.quality === "320kbps") : null;
            const url = downloadObj ? downloadObj.url : (item.downloadUrl && item.downloadUrl.length > 0 ? item.downloadUrl[item.downloadUrl.length - 1].url : null);

            return {
                id: item.id,
                name: item.name,
                artist: item.artists.primary.map(a => a.name).join(", "),
                image: image,
                url: url,
                album: item.album ? item.album.name : "Single",
                isApiSong: true
            };
        });
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
};
