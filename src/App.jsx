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

import { Analytics } from "@vercel/analytics/react";

function App() {
  // ... (existing hooks)
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const analyserRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  // ... (rest of state)

  // ... (useEffect hooks)

  // ... (PlaySong, TogglePlay, etc.)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white">
      <Analytics />
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
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
        onOpenFullScreen={openPlayer}
      />

      <FullScreenPlayer
        isOpen={isPlayerOpen}
        onClose={closePlayer}

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
        analyser={analyserRef.current}
        queue={queue}
        onPlayQueueSong={playSong}
      />

    </div>
  );
}

export default App;
