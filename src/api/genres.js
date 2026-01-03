export const GENRES = [
    { id: 'pop', name: 'Pop', color: 'from-pink-500 to-rose-500', icon: '🎤', playlistId: '303128179' }, // Best Of Pop - English
    { id: 'rock', name: 'Rock', color: 'from-red-600 to-orange-600', icon: '🎸', playlistId: '169030551' }, // Rock To Work
    { id: 'indie', name: 'Indie', color: 'from-emerald-500 to-teal-500', icon: '🌿', playlistId: '156473621' }, // Asli Pop (Indie)
    { id: 'hiphop', name: 'Hip Hop', color: 'from-purple-600 to-indigo-600', icon: '🎧', playlistId: '1265128247' }, // Hip Hop Hits 2025
    { id: 'electronic', name: 'Electronic', color: 'from-cyan-500 to-blue-500', icon: '🎹', playlistId: '804316688' }, // Best Of EDM
    { id: 'classical', name: 'Classical', color: 'from-amber-700 to-yellow-600', icon: '🎻', playlistId: '112761792' }, // Classical Ambience
    { id: 'jazz', name: 'Jazz', color: 'from-slate-700 to-gray-600', icon: '🎷', playlistId: '31533921' }, // Best Of Jazz - English
    { id: 'lofi', name: 'Lo-Fi', color: 'from-indigo-400 to-purple-300', icon: '☕', playlistId: '1151392174' }, // Telugu LoFi (Beats are universal)
];

// Mock function to get songs by genre (filtering trending for now)
export const getSongsByGenre = (genreId, allSongs) => {
    // In a real app this would query the API.
    // Here we just return a random subset of allSongs for demo purposes
    // since our mock data might not have genre tags.
    // Or we can deterministically hash the ID to pick songs.
    return allSongs.filter((_, i) => (i + genreId.length) % 3 === 0);
};
