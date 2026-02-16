import React from 'react';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 bg-[rgba(127,48,48,0)]">
      <div className="w-full">
        <MusicPlayer />

      </div>
    </div>
  );
}