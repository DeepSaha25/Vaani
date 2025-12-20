import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Playbar from './components/Playbar';
import { folderSongs, albums as folderOrder } from './data/songs';
import { searchSongs } from './api/music';

function App() {
  const [songs, setSongs] = useState([]);
  const [currFolder, setCurrFolder] = useState(null);
  const [currentSongName, setCurrentSongName] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]); // Stores full paths: "songs/Folder/Song.mp3"

  // Search State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const audioRef = useRef(new Audio());
  const lastVolumeRef = useRef(1);

  // Initialize Audio Events
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle Play/Pause State Sync
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      // If already playing, this promise resolves immediately? 
      // We check if it's paused to avoid redundant calls or interruptions
      if (audio.paused) {
        audio.play().catch(e => console.error("Play failed", e));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle Volume
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Load songs logic
  const loadFolder = useCallback((folder) => {
    let newSongs = [];
    if (folder === 'Liked Songs') {
      // Map full paths to filenames
      newSongs = likedSongs.map(path => path.split('/').pop());
    } else {
      newSongs = folderSongs[folder] || [];
    }
    setSongs(newSongs);
    setCurrFolder(folder);
    return newSongs;
  }, [likedSongs]);

  // Helper to get full path
  const getFullPath = (trackName, folder) => {
    if (folder === 'Liked Songs') {
      return likedSongs.find(path => path.endsWith('/' + trackName));
    } else {
      return `songs/${folder}/${trackName}`;
    }
  };

  const playMusic = useCallback((track, folder = currFolder) => {
    if (!track) return;

    // Determine if track is an API object or a string filename
    let src;
    let trackName;

    if (typeof track === 'object' && track.isApiSong) {
      src = track.url;
      trackName = track.name;

      if (isSearching) {
        setSongs(searchResults);
        setCurrFolder("Search Results");
      }
    } else {
      // Local file
      trackName = track; // It's a string

      // Ensure folder logic
      if (folder !== currFolder && folder !== "Search Results") {
        loadFolder(folder);
      }
      src = getFullPath(track, folder);
    }

    if (!src) {
      console.error("No source found for track:", track);
      return;
    }

    audioRef.current.src = src;
    setCurrentSongName(trackName);

    // Explicitly try to play when changing tracks
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error("Playback failed", error);
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(true);
    }
  }, [currFolder, likedSongs, loadFolder, isSearching, searchResults]);


  // Next/Prev Logic
  // We need current state of songs and currFolder inside these functions.
  // Since they are called by event handlers or manually, access to state is fine if defined in component scope.
  // HOWEVER, the 'ended' listener defined in useEffect needs access to fresh 'songs' and 'currFolder'.
  // The useEffect dependent on [] will have stale state.
  // Solution: Use a ref for songs/currFolder OR update the event listener when they change.
  // Better: Create a 'handleNext' function wrapping the logic and add it to useEffect dependencies?
  // Or just use a mutable ref that tracks current playlist state.

  // Let's use Refs for playlist state to avoid re-attaching listeners constantly causing audio glitches?
  // Actually, re-attaching listeners is cheap.
  // But let's try to keep it simple.

  // Handle Search
  const handleSearch = async (query) => {
    if (!query) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchSongs(query);
    setSearchResults(results);
  };

  const handleNext = async () => {
    if (!songs || songs.length === 0) return;

    // Find index. 
    // If songs contains objects (API), currentSongName matches obj.name
    // If songs contains strings (Local), currentSongName matches string
    const currentTrackIndex = songs.findIndex(s => {
      return (typeof s === 'string' ? s : s.name) === currentSongName;
    });

    // 1. Next in current list
    if (currentTrackIndex !== -1 && currentTrackIndex + 1 < songs.length) {
      playMusic(songs[currentTrackIndex + 1], currFolder);
      return;
    }

    // 2. End of list logic...
    if (currFolder === 'Liked Songs' || currFolder === 'Search Results') {
      setIsPlaying(false); // Stop
      return;
    }

    // 3. Next Album logic (only for local folders)
    if (folderOrder.includes(currFolder)) {
      const currentAlbumIndex = folderOrder.indexOf(currFolder);
      if (currentAlbumIndex !== -1 && currentAlbumIndex + 1 < folderOrder.length) {
        const nextAlbum = folderOrder[currentAlbumIndex + 1];
        const nextSongs = folderSongs[nextAlbum];
        if (nextSongs && nextSongs.length > 0) {
          setCurrFolder(nextAlbum);
          setSongs(nextSongs);
          playMusic(nextSongs[0], nextAlbum);
        }
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (!songs || songs.length === 0) return;
    const currentTrackIndex = songs.findIndex(s => {
      return (typeof s === 'string' ? s : s.name) === currentSongName;
    });

    if (currentTrackIndex === -1) {
      playMusic(songs[0], currFolder);
    } else if (currentTrackIndex - 1 < 0) {
      playMusic(songs[songs.length - 1], currFolder);
    } else {
      playMusic(songs[currentTrackIndex - 1], currFolder);
    }
  };


  // Toggle Like Album
  const toggleLikeAlbum = (folderName) => {
    const songsInAlbum = folderSongs[folderName] || [];
    const firstSongPath = `songs/${folderName}/${songsInAlbum[0]}`;
    const isLiked = likedSongs.includes(firstSongPath);

    if (isLiked) {
      // Unlike: Remove all songs of this album from likedSongs
      const pathsToRemove = songsInAlbum.map(s => `songs/${folderName}/${s}`);
      setLikedSongs(prev => prev.filter(p => !pathsToRemove.includes(p)));
    } else {
      // Like: Add all songs of this album
      const pathsToAdd = songsInAlbum.map(s => `songs/${folderName}/${s}`);
      // Filter out duplicates (though shouldn't exist if strictly album based)
      setLikedSongs(prev => {
        const newSet = new Set([...prev, ...pathsToAdd]);
        return Array.from(newSet);
      });
    }

    // If we are currently viewing Liked Songs, force update of the list?
    // Since likedSongs is in dependency of loadFolder, if we call loadFolder('Liked Songs') it updates.
    // But we need to trigger it.
    if (currFolder === 'Liked Songs') {
      // It's tricky because 'loadSongs' is a callback.
      // Effect observing likedSongs?
    }
  };

  // Effect to refresh "Liked Songs" view when likedSongs changes
  useEffect(() => {
    if (currFolder === 'Liked Songs') {
      const newSongs = likedSongs.map(path => path.split('/').pop());
      setSongs(newSongs); // Update displayed list
    }
  }, [likedSongs, currFolder]);


  // Initialize first album on load
  useEffect(() => {
    // "Kiliye Kiliye" default
    loadFolder("Kiliye Kiliye");
  }, [loadFolder]);


  const handleAlbumClick = (folder) => {
    const newSongs = loadFolder(folder);
    if (newSongs && newSongs.length > 0) {
      playMusic(newSongs[0], folder);
    }
  };

  return (
    <div className="container flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        songs={songs}
        playMusic={(track) => playMusic(track, currFolder)}
        currentSongName={currentSongName}
        setCurrFolder={(f) => {
          // If switching to library folders, clear search state
          setIsSearching(false);
          loadFolder(f);
        }}
        likedSongs={likedSongs}
      />

      <MainContent
        setSidebarOpen={setSidebarOpen}
        likedSongs={likedSongs}
        onAlbumClick={(f) => {
          setIsSearching(false); // Clear search when clicking album
          handleAlbumClick(f);
        }}
        toggleLikeAlbum={toggleLikeAlbum}
        onSearch={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
        onPlayApiSong={(song) => {
          // When playing from click in search results
          // We want to update the playlist context?
          // Yes, set playlist to searchResults
          setSongs(searchResults);
          setCurrFolder("Search Results");
          playMusic(song, "Search Results");
        }}
      />

      <Playbar
        currentSongName={currentSongName}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onVolumeChange={setVolume}
        onSeek={(percent) => {
          if (audioRef.current.duration) {
            audioRef.current.currentTime = (audioRef.current.duration * percent) / 100;
          }
        }}
      />
    </div>
  );
}

export default App;
