export const GENRES = [
    { id: 'pop', name: 'Pop', color: 'from-pink-500 to-rose-500', icon: '🎤' },
    { id: 'rock', name: 'Rock', color: 'from-red-600 to-orange-600', icon: '🎸' },
    { id: 'indie', name: 'Indie', color: 'from-emerald-500 to-teal-500', icon: '🌿' },
    { id: 'hiphop', name: 'Hip Hop', color: 'from-purple-600 to-indigo-600', icon: '🎧' },
    { id: 'electronic', name: 'Electronic', color: 'from-cyan-500 to-blue-500', icon: '🎹' },
    { id: 'classical', name: 'Classical', color: 'from-amber-700 to-yellow-600', icon: '🎻' },
    { id: 'jazz', name: 'Jazz', color: 'from-slate-700 to-gray-600', icon: '🎷' },
    { id: 'lofi', name: 'Lo-Fi', color: 'from-indigo-400 to-purple-300', icon: '☕' },
];

// Mock function to get songs by genre (filtering trending for now)
export const getSongsByGenre = (genreId, allSongs) => {
    // In a real app this would query the API.
    // Here we just return a random subset of allSongs for demo purposes
    // since our mock data might not have genre tags.
    // Or we can deterministically hash the ID to pick songs.
    return allSongs.filter((_, i) => (i + genreId.length) % 3 === 0);
};
