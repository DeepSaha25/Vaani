import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Playbar from './components/Playbar';
import { folderSongs, albums as folderOrder } from './data/songs';

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
      return `/songs/${folder}/${trackName}`;
    }
  };

  const playMusic = useCallback((trackName, folder = currFolder) => {
    if (!trackName) return;

    // If getting ready to play, ensure we have the songs loaded for that folder if changed
    if (folder !== currFolder) {
      loadFolder(folder);
      // We need to wait for state update? No, just use local var if needed, 
      // but since we passed folder explicitly we can determine path.
    }

    const path = getFullPath(trackName, folder);
    if (!path) return;

    audioRef.current.src = path;
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
  }, [currFolder, likedSongs, loadFolder]);


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

  // Re-write event listener effect to depend on the Next logic dependencies
  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => handleNext();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [songs, currFolder, currentSongName]); // Re-bind when playlist changes

  const handleNext = async () => {
    if (!songs || songs.length === 0) return;

    const currentTrackIndex = songs.indexOf(currentSongName);

    // 1. Next in current list
    if (currentTrackIndex !== -1 && currentTrackIndex + 1 < songs.length) {
      playMusic(songs[currentTrackIndex + 1], currFolder);
      return;
    }

    // 2. End of list
    if (currFolder === 'Liked Songs') {
      setIsPlaying(false); // Stop
      return;
    }

    // 3. Next Album
    const currentAlbumIndex = folderOrder.indexOf(currFolder);
    if (currentAlbumIndex !== -1 && currentAlbumIndex + 1 < folderOrder.length) {
      const nextAlbum = folderOrder[currentAlbumIndex + 1];
      const nextSongs = folderSongs[nextAlbum]; // Directly access data
      if (nextSongs && nextSongs.length > 0) {
        // Update state
        setCurrFolder(nextAlbum);
        setSongs(nextSongs);
        playMusic(nextSongs[0], nextAlbum);
      }
    } else {
      setIsPlaying(false); // End of all albums
    }
  };

  const handlePrev = () => {
    if (!songs || songs.length === 0) return;
    const currentTrackIndex = songs.indexOf(currentSongName);

    if (currentTrackIndex === -1) {
      playMusic(songs[0], currFolder);
    } else if (currentTrackIndex - 1 < 0) {
      playMusic(songs[songs.length - 1], currFolder); // Loop to last? Original did this.
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
        setCurrFolder={(f) => loadFolder(f)}
        likedSongs={likedSongs}
      />

      <MainContent
        setSidebarOpen={setSidebarOpen}
        likedSongs={likedSongs}
        onAlbumClick={handleAlbumClick}
        toggleLikeAlbum={toggleLikeAlbum}
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
