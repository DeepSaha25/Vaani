import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Playbar from './components/Playbar';
import FullScreenPlayer from './components/FullScreenPlayer';
import { searchSongs, getTrendingSongs } from './api/music';
import { saveSongToDB, getAllDownloadedSongs, deleteSongFromDB } from './utils/db';

// Storage Keys
const STORAGE_KEYS = {
  LIKED: 'vaani_liked_songs',
  RECENT: 'vaani_recently_played',
  PLAYLISTS: 'vaani_playlists'
};

function App() {
  // --- Audio State ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // --- Queue & Playback Logic ---
  const [queue, setQueue] = useState([]); // List of song objects
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loopMode, setLoopMode] = useState('all'); // 'off', 'all', 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState([]); // Array of indices mapping for shuffle

  // --- Persisted User Data ---
  const [likedSongs, setLikedSongs] = useState([]); // Array of song objects now (not just paths)
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [playlists, setPlaylists] = useState([]); // [{id: 1, name: 'My Mix', songs: []}]

  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home'); // 'home', 'search', 'library', 'playlist', 'liked'
  const [viewData, setViewData] = useState(null); // Metadata for current view (e.g. playlist ID)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false); // Fullscreen player state

  // --- Discovery Logic (Radio) ---
  const startRadio = (seedSong) => {
    // 1. Create a "mix" based on the seed song
    // For now, we take the seed song + shuffled trending songs
    const mix = [seedSong, ...trendingSongs.filter(s => s.id !== seedSong.id).sort(() => Math.random() - 0.5)];

    // 2. Play the mix
    playSong(seedSong, mix);
    alert(`Started Radio based on "${seedSong.name}"`);
  };

  // --- Load Data from Storage ---
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Downloads State ---
  const [downloads, setDownloads] = useState([]);

  // --- Downloads Logic ---
  const handleDownload = async (song) => {
    try {
      const confirmed = window.confirm(`Download "${song.name}" for offline play?`);
      if (!confirmed) return;

      if (!song.url) {
        alert("Download failed: No URL found.");
        return;
      }

      // Toast-like notification
      const toast = document.createElement("div");
      toast.innerText = "Downloading...";
      toast.style.cssText = "position:fixed;bottom:80px;right:20px;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3); font-weight:bold;";
      document.body.appendChild(toast);

      const response = await fetch(song.url);
      const blob = await response.blob();

      // 1. Save to DB (In-App Offline)
      await saveSongToDB(song, blob);

      // 2. Trigger File Download (Local File)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.name}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.innerText = "Downloaded successfully!";
      setTimeout(() => toast.remove(), 3000);

      // Update state
      const updated = await getAllDownloadedSongs();
      setDownloads(updated);
    } catch (e) {
      console.error("Download failed", e);
      alert("Download failed. Please try again.");
      const t = document.querySelector('div[style*="position:fixed;bottom:80px"]');
      if (t) t.remove();
    }
  };

  const handleDeleteDownload = async (song) => {
    if (window.confirm(`Remove "${song.name}" from offline storage?`)) {
      await deleteSongFromDB(song.id);
      setDownloads(prev => prev.filter(s => s.id !== song.id));
    }
  };

  // Load downloads on mount
  useEffect(() => {
    getAllDownloadedSongs().then(setDownloads);
  }, []);

  // --- Load Data from Storage ---
  useEffect(() => {
    const load = (key, setter) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) setter(JSON.parse(stored));
      } catch (e) { console.error(`Failed to load ${key}`, e); }
    };
    load(STORAGE_KEYS.LIKED, setLikedSongs);
    load(STORAGE_KEYS.RECENT, setRecentlyPlayed);
    load(STORAGE_KEYS.PLAYLISTS, setPlaylists);

    // Load Trending Cache immediately for instant UI
    load('vaani_trending_cache_v2', setTrendingSongs);

    setIsLoaded(true);

    // Fetch Fresh Trending Data (Stale-while-revalidate)
    getTrendingSongs().then(res => {
      if (res && res.length > 0) {
        setTrendingSongs(res);
        localStorage.setItem('vaani_trending_cache_v2', JSON.stringify(res));
      }
    });
  }, []);

  // --- Save Data to Storage ---
  useEffect(() => { if (isLoaded) localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedSongs)); }, [likedSongs, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentlyPlayed)); }, [recentlyPlayed, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists)); }, [playlists, isLoaded]);

  // --- Core Playback Functions ---

  // 1. Play a specific song
  const playSong = useCallback((song, contextQueue = null) => {
    if (!song) return;

    // If a new context (queue) is provided, replace queue
    if (contextQueue) {
      setQueue(contextQueue);
      const index = contextQueue.findIndex(s => s.id === song.id);
      setCurrentIndex(index);
      if (isShuffle) generateShuffleIndices(contextQueue.length);
    } else {
      // Playing from current queue? Or standalone? 
      // If standalone, we should probably add to queue or replace queue?
      // For now, if no context provided, assume it's just this song (e.g. search result click)
      // But usually we pass the whole search result as queue
      if (currentIndex === -1 || !queue.find(s => s.id === song.id)) {
        setQueue([song]);
        setCurrentIndex(0);
      } else {
        // Song is in queue, find it
        const index = queue.findIndex(s => s.id === song.id);
        setCurrentIndex(index);
      }
    }

    // Add to Recent
    setRecentlyPlayed(prev => {
      const temp = prev.filter(s => s.id !== song.id);
      return [song, ...temp].slice(0, 50); // Keep last 50
    });

    setIsPlaying(true);
  }, [queue, isShuffle, currentIndex]);


  // 2. Play/Pause Toggle
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(p => !p);
    }
  }, [isPlaying]);

  // 3. Audio Element Management
  useEffect(() => {
    if (currentIndex === -1 || queue.length === 0) return;
    const song = queue[currentIndex];
    if (!audioRef.current || !song) return;

    // Only change src if it's different to prevent reload on re-render
    // However, we rely on currentIndex changing.
    const currentSrc = audioRef.current.src;
    // song.url is the stream url
    if (currentSrc !== song.url) {
      audioRef.current.src = song.url;
      audioRef.current.load();
      if (isPlaying) {
        const promise = audioRef.current.play();
        if (promise) promise.catch(e => console.error("Play error", e));
      }
    }
  }, [currentIndex, queue, isPlaying]);

  // 4. Handle Next / Prev / Ended
  const generateShuffleIndices = (length) => {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledIndices(arr);
  };

  // Recalculate shuffle if queue changes length significantly
  useEffect(() => {
    if (isShuffle && queue.length > 0 && shuffledIndices.length !== queue.length) {
      generateShuffleIndices(queue.length);
    }
  }, [queue.length, isShuffle]);


  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex;
    if (isShuffle) {
      // Find current pos in shuffled array
      const currentShufflePos = shuffledIndices.indexOf(currentIndex);
      if (currentShufflePos === -1 || currentShufflePos >= queue.length - 1) {
        // End of shuffle, loop or stop
        if (loopMode === 'all') {
          // Autoplay: Add random trending
          if (trendingSongs.length > 0) {
            const randomSong = trendingSongs[Math.floor(Math.random() * trendingSongs.length)];
            // Prevent duplicate if it's the exact same song just played? allow for now.
            // We need to add to queue and update indices
            // BUT we can't easily modify queue state and immediately see it in this closure if we rely on it for nextIndex
            // So we will setQueue and let the effect/render cycle handle it?
            // No, we need to play it immediately.
            const newQueue = [...queue, randomSong];
            setQueue(newQueue);

            // If shuffle is on, we need to add the new index to shuffledIndices
            setShuffledIndices(prev => [...prev, newQueue.length - 1]);

            nextIndex = newQueue.length - 1;
          } else {
            nextIndex = shuffledIndices[0];
          }
        }
        else { setIsPlaying(false); return; }
      } else {
        nextIndex = shuffledIndices[currentShufflePos + 1];
      }
    } else {
      // Normal
      if (currentIndex >= queue.length - 1) {
        if (loopMode === 'all') {
          // Autoplay logic
          if (trendingSongs.length > 0) {
            let randomSong = trendingSongs[Math.floor(Math.random() * trendingSongs.length)];
            // Minimize immediate repetitions if possible
            if (randomSong.id === queue[currentIndex]?.id && trendingSongs.length > 1) {
              const others = trendingSongs.filter(s => s.id !== randomSong.id);
              randomSong = others[Math.floor(Math.random() * others.length)];
            }

            const newQueue = [...queue, randomSong];
            setQueue(newQueue);
            nextIndex = newQueue.length - 1;
          } else {
            nextIndex = 0;
          }
        }
        else { setIsPlaying(false); return; }
      } else {
        nextIndex = currentIndex + 1;
      }
    }
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  }, [queue, currentIndex, isShuffle, loopMode, shuffledIndices, trendingSongs]);


  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex;
    if (isShuffle) {
      const currentShufflePos = shuffledIndices.indexOf(currentIndex);
      if (currentShufflePos <= 0) prevIndex = shuffledIndices[queue.length - 1]; // Loop back? or 0
      else prevIndex = shuffledIndices[currentShufflePos - 1];
    } else {
      if (currentIndex <= 0) prevIndex = queue.length - 1;
      else prevIndex = currentIndex - 1;
    }
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  }, [queue, currentIndex, isShuffle, shuffledIndices]);

  const handleEnded = () => {
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  // Media Session API (Background Playback & Notifications)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const currentSong = queue[currentIndex];
      if (currentSong) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.name,
          artist: currentSong.artist || "Unknown",
          album: currentSong.album || "Vaani",
          artwork: [{ src: currentSong.image || 'img/vaanilogo.png', sizes: '512x512', type: 'image/jpeg' }]
        });
      }
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
  }, [currentIndex, queue, isPlaying, togglePlay, handlePrev, handleNext]);


  // --- Playlist & Like Logic ---
  const toggleLike = (song) => {
    const exists = likedSongs.find(s => s.id === song.id);
    if (exists) {
      setLikedSongs(prev => prev.filter(s => s.id !== song.id));
    } else {
      setLikedSongs(prev => [song, ...prev]);
    }
  };

  const addToPlaylist = (playlistId, song) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.songs.find(s => s.id === song.id)) return pl; // No duplicates
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    }));
  };

  const createPlaylist = (name) => {
    const newPl = { id: Date.now(), name, songs: [] };
    setPlaylists(prev => [...prev, newPl]);
  };

  const deletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== id));
  };


  // --- API & Search ---
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);

    // Only push state if entering search view
    if (activeView !== 'search') {
      setActiveView('search');
      window.history.pushState({ view: 'search', data: null }, '', '');
    }

    const res = await searchSongs(query);
    setSearchResults(res);
  };

  // --- Navigation Helpers ---
  // --- Navigation Helpers ---

  // Handle Browser History (Back Button)
  useEffect(() => {
    // Restore state if available (e.g. refresh), otherwise init
    if (window.history.state) {
      setActiveView(window.history.state.view);
      setViewData(window.history.state.data);
      if (window.history.state.view === 'search') setIsSearching(true);
    } else {
      window.history.replaceState({ view: 'home', data: null }, '', '');
    }

    const onPopState = (event) => {
      if (event.state) {
        setActiveView(event.state.view);
        setViewData(event.state.data);
        // Manage search state based on view
        if (event.state.view !== 'search') setIsSearching(false);
        else setIsSearching(true);
      } else {
        setActiveView('home');
        setIsSearching(false);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (view, data = null) => {
    // Avoid pushing duplicate states on rapid clicks
    if (activeView === view && JSON.stringify(viewData) === JSON.stringify(data)) return;

    setActiveView(view);
    setViewData(data);
    if (window.innerWidth < 768) setSidebarOpen(false);

    window.history.pushState({ view, data }, '', '');
  };


  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration);
        }}
        onEnded={handleEnded}
        onError={(e) => {
          console.error("Audio error", e);
          handleNext(); // Skip if error
        }}
        volume={volume}
      />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        viewData={viewData}
        playlists={playlists}
        onCreatePlaylist={createPlaylist}
        onNavigate={navigateTo}
        isPlaybarVisible={queue.length > 0}
      />

      <MainContent
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        viewData={viewData}

        // Content Props
        searchResults={searchResults}
        isSearching={isSearching}
        playlists={playlists}
        likedSongs={likedSongs}
        recentlyPlayed={recentlyPlayed}
        trendingSongs={trendingSongs}

        // Actions
        onSearch={handleSearch}
        onPlay={(song, context) => playSong(song, context)} // context = list of songs
        toggleLike={toggleLike}
        addToPlaylist={addToPlaylist}
        deletePlaylist={deletePlaylist}
        currentSong={queue[currentIndex]}
        onNavigate={navigateTo}

        // Downloads
        downloads={downloads}
        onDownload={handleDownload}
        onDeleteDownload={handleDeleteDownload}
        onStartRadio={startRadio}
      />

      <Playbar
        currentSong={queue[currentIndex]}
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onNext={handleNext}
        onPrev={handlePrev}

        currentTime={currentTime}
        duration={duration}
        onSeek={(time) => audioRef.current.currentTime = time}

        volume={volume}
        onVolumeChange={(v) => { setVolume(v); audioRef.current.volume = v; }}

        loopMode={loopMode}
        toggleLoop={() => setLoopMode(prev => prev === 'off' ? 'all' : (prev === 'all' ? 'one' : 'off'))}

        isShuffle={isShuffle}
        toggleShuffle={() => {
          setIsShuffle(!isShuffle);
          if (!isShuffle && queue.length > 0) generateShuffleIndices(queue.length);
        }}

        // Downloads
        onDownload={() => {
          if (queue[currentIndex]) handleDownload(queue[currentIndex]);
        }}
        isDownloaded={queue[currentIndex] && downloads.some(d => d.id === queue[currentIndex].id)}
        onOpenFullScreen={() => setIsPlayerOpen(true)}
      />

      <FullScreenPlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}

        currentSong={queue[currentIndex]}
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onNext={handleNext}
        onPrev={handlePrev}

        currentTime={currentTime}
        duration={duration}
        onSeek={(time) => {
          if (audioRef.current) audioRef.current.currentTime = time;
        }}

        volume={volume}
        onVolumeChange={(v) => { setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}

        loopMode={loopMode}
        toggleLoop={() => setLoopMode(prev => prev === 'off' ? 'all' : (prev === 'all' ? 'one' : 'off'))}

        isShuffle={isShuffle}
        toggleShuffle={() => {
          setIsShuffle(!isShuffle);
          if (!isShuffle && queue.length > 0) generateShuffleIndices(queue.length);
        }}

        onDownload={() => {
          if (queue[currentIndex]) handleDownload(queue[currentIndex]);
        }}
        isDownloaded={queue[currentIndex] && downloads.some(d => d.id === queue[currentIndex].id)}

        audioRef={audioRef}
        queue={queue}
        onPlayQueueSong={playSong}
      />

    </div>
  );
}

export default App;
