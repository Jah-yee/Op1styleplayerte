import React, { useState, useRef, useEffect } from "react";
import { Slider } from "./ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { TrackUploader } from "./TrackUploader";
import BackfaceIcon11 from "../imports/BackfaceIcon11-2016-861";
import Vector from "../imports/Vector";
import Vector241 from "../imports/Vector241";
import Frame116 from "../imports/Frame116";
import svgPaths from "../imports/svg-xpr8sjhfut";
import svgPathsVolume from "../imports/svg-f2hx7vueon";

interface Track {
  id: number;
  name: string;
  duration: number;
  color: string;
  audioUrl: string; // Required: only real audio files supported
}

interface UploadedTrack {
  id: number;
  name: string;
  duration: number;
  color: string;
  audioUrl: string;
  file: File;
}

// Static default track configuration
const staticDefaultTrack: Omit<Track, "duration"> = {
  id: 1,
  name: "Default Track", // You can change this name to match your track
  color: "#3D6087",
  audioUrl: "/audio/default-track.mp3", // Path to your static audio file
};

// Left disk component extracted from Tape design
function LeftReel() {
  return (
    <div className="relative size-full" data-name="tapeleft">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 246 246"
      >
        <g id="left">
          <circle
            cx="123"
            cy="123"
            id="Ellipse 186"
            r="121"
            stroke="var(--stroke-0, #CDD0C3)"
            strokeWidth="4"
          />
          <g id="Group 158">
            <circle
              cx="122.5"
              cy="122.5"
              fill="var(--fill-0, #3F3933)"
              id="Ellipse 187"
              r="93.5"
            />
            <path
              d={svgPaths.p3f4e7880}
              fill="var(--fill-0, #A1A3A5)"
              id="Union"
            />
            <g id="Group 157">
              <circle
                cx="122.5"
                cy="122.5"
                fill="var(--fill-0, #CDD0C3)"
                id="Ellipse 188"
                r="68.5"
              />
              <g id="Frame 97">
                <path
                  d={svgPaths.p179dbe80}
                  fill="var(--fill-0, black)"
                  id="Union_2"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

// Right reel component extracted from Tape design
function RightReel() {
  return (
    <div className="relative size-full" data-name="taperight">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 246 246"
      >
        <g id="right">
          <circle
            cx="123"
            cy="123"
            id="Ellipse 186"
            r="121"
            stroke="var(--stroke-0, #CDD0C3)"
            strokeWidth="4"
          />
          <rect
            fill="var(--fill-0, #A1A3A5)"
            height="37"
            id="Rectangle 669"
            width="5"
            x="121"
            y="19"
          />
          <rect
            fill="var(--fill-0, #A1A3A5)"
            height="37"
            id="Rectangle 670"
            width="5"
            x="121"
            y="189"
          />
          <g id="Group 159">
            <circle
              cx="122.5"
              cy="122.5"
              fill="var(--fill-0, #CDD0C3)"
              id="Ellipse 188"
              r="68.5"
            />
            <g id="Frame 97">
              <path
                clipRule="evenodd"
                d={svgPaths.pf226c00}
                fill="var(--fill-0, black)"
                fillRule="evenodd"
                id="Union"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

// Interactive Volume component using Frame116 design
function InteractiveVolumeDisplay({
  volume,
  onVolumeChange,
}: {
  volume: number;
  onVolumeChange: (value: number) => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(
      0,
      Math.min(100, 100 - (y / rect.height) * 100),
    );
    // Round to nearest 5% increment
    const roundedPercentage = Math.round(percentage / 5) * 5;
    onVolumeChange(roundedPercentage);
  };

  // Calculate how many bars should be lit based on volume (0-100%)
  // 14 total bars, so each bar represents ~7.14% of volume
  const totalBars = 14;
  const activeBars = Math.round((volume / 100) * totalBars);

  return (
    <div
      className="relative size-full cursor-pointer"
      onClick={handleClick}
    >
      {/* Volume bars display */}
      <div className="box-border content-stretch flex flex-col-reverse gap-2.5 items-start justify-start p-0 relative size-full">
        {Array.from({ length: totalBars }, (_, i) => {
          const isActive = i < activeBars;
          return (
            <div
              key={i}
              className={`h-3 shrink-0 w-full transition-colors duration-150 ${
                isActive ? "bg-[#ef3e22]" : "bg-[#28221c]"
              }`}
            />
          );
        })}
      </div>

      {/* Invisible overlay for better interaction */}
      <div className="absolute inset-0">
        <Slider
          value={[volume]}
          onValueChange={(value) => {
            // Round to nearest 5% increment
            const roundedValue = Math.round(value[0] / 5) * 5;
            onVolumeChange(roundedValue);
          }}
          max={100}
          min={0}
          step={5}
          orientation="vertical"
          className="w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [leftReelRotation, setLeftReelRotation] = useState(0);
  const [rightReelRotation, setRightReelRotation] = useState(0);
  const [customTracks, setCustomTracks] = useState<
    UploadedTrack[]
  >([]);
  const [defaultTrack, setDefaultTrack] =
    useState<Track | null>(null);
  const [isLoadingDefault, setIsLoadingDefault] =
    useState(true);
  const [defaultTrackError, setDefaultTrackError] = useState<
    string | null
  >(null);
  const [frequencyData, setFrequencyData] =
    useState<Uint8Array>(new Uint8Array(8));
  const [isUploadDialogOpen, setIsUploadDialogOpen] =
    useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Audio refs for real audio files and analysis
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(
    null,
  );

  // Load static default track on component mount
  useEffect(() => {
    const loadDefaultTrack = async () => {
      try {
        // Check if the file exists by making a HEAD request
        const response = await fetch(
          staticDefaultTrack.audioUrl,
          { method: "HEAD" },
        );
        if (!response.ok) {
          throw new Error(
            `File not found (${response.status})`,
          );
        }

        // Create audio element to get duration
        const audio = new Audio();

        // Set up event listeners before setting src
        const loadPromise = new Promise<void>(
          (resolve, reject) => {
            const onLoadedMetadata = () => {
              cleanup();
              resolve();
            };

            const onError = (e: Event) => {
              cleanup();
              reject(
                new Error(
                  "Invalid audio file or unsupported format",
                ),
              );
            };

            const cleanup = () => {
              audio.removeEventListener(
                "loadedmetadata",
                onLoadedMetadata,
              );
              audio.removeEventListener("error", onError);
            };

            audio.addEventListener(
              "loadedmetadata",
              onLoadedMetadata,
            );
            audio.addEventListener("error", onError);

            // Set a timeout to avoid hanging
            setTimeout(() => {
              cleanup();
              reject(
                new Error("Timeout loading audio metadata"),
              );
            }, 10000);
          },
        );

        audio.src = staticDefaultTrack.audioUrl;
        audio.load();

        await loadPromise;

        // Set the default track with actual duration
        setDefaultTrack({
          ...staticDefaultTrack,
          duration: audio.duration || 180, // Fallback to 3 minutes
        });

        console.log(
          `Loaded default track: ${staticDefaultTrack.name} (${audio.duration}s)`,
        );
        setDefaultTrackError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error";
        console.log(
          `Default track not available: ${errorMessage}`,
        );
        setDefaultTrackError(errorMessage);
        setDefaultTrack(null);
      } finally {
        setIsLoadingDefault(false);
      }
    };

    loadDefaultTrack();
  }, []);

  // Setup Web Audio API for frequency analysis
  const setupAudioAnalysis = () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create analyser node
      analyserRef.current =
        audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32; // Small FFT size for 8 frequency bands
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Create source from audio element
      sourceRef.current =
        audioContextRef.current.createMediaElementSource(
          audioRef.current,
        );

      // Connect: source -> analyser -> destination
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(
        audioContextRef.current.destination,
      );

      console.log("Audio analysis setup complete");
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  };

  // Update frequency data for waveform visualization
  const updateFrequencyData = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 8 frequency bands for our 8 waveform bars
    const sampledData = new Uint8Array(8);
    const step = Math.floor(bufferLength / 8);

    for (let i = 0; i < 8; i++) {
      const startIndex = i * step;
      const endIndex = Math.min(
        startIndex + step,
        bufferLength,
      );
      let sum = 0;

      // Average the frequency data in this band
      for (let j = startIndex; j < endIndex; j++) {
        sum += dataArray[j];
      }

      sampledData[i] = sum / (endIndex - startIndex);
    }

    setFrequencyData(sampledData);
  };

  // Animation loop for real-time frequency analysis
  const startFrequencyAnalysis = () => {
    if (!analyserRef.current) return;

    const animate = () => {
      updateFrequencyData();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopFrequencyAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Get active tracks: custom tracks if available, otherwise default track if available
  const activeTracks: Track[] =
    customTracks.length > 0
      ? customTracks.map((track, index) => {
          return {
            id: track.id,
            name: track.name,
            duration: track.duration,
            color: track.color,
            audioUrl: track.audioUrl,
          };
        })
      : defaultTrack
        ? [defaultTrack]
        : [];

  // Define derived values before useEffects
  const totalDuration =
    activeTracks[currentTrack]?.duration || 240;
  const currentTrackData = activeTracks[currentTrack];
  const hasActiveTracks = activeTracks.length > 0;

  // Log active tracks when they change and ensure audio sync
  useEffect(() => {
    console.log('=== ACTIVE TRACKS UPDATED ===');
    console.log(`Total active tracks: ${activeTracks.length}`);
    console.log('Active tracks list:', activeTracks.map((track, index) => 
      `${index + 1}: ${track.name} (ID: ${track.id})`
    ));
    console.log(`Current track index: ${currentTrack}`);
    if (activeTracks.length > 0) {
      console.log(`Currently selected track: ${activeTracks[currentTrack]?.name || 'Index out of bounds'}`);
      console.log(`Track data for current index:`, currentTrackData);
    }
    
    // Ensure audio element matches current track when tracks or currentTrack changes
    if (audioRef.current && currentTrackData && audioRef.current.src !== currentTrackData.audioUrl) {
      console.log(`⚠️  Audio element src mismatch detected!`);
      console.log(`   Audio element src: ${audioRef.current.src}`);
      console.log(`   Current track URL: ${currentTrackData.audioUrl}`);
      console.log(`   Recreating audio element...`);
      
      // Force recreation of audio element
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        stopAudio();
      }
      
      audioRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (wasPlaying) {
        setTimeout(() => {
          startAudio();
        }, 100);
      }
    }
    
    console.log('=== END ACTIVE TRACKS ===');
  }, [activeTracks, currentTrack, isPlaying]); // Removed currentTrackData from dependencies since it's derived from activeTracks and currentTrack

  useEffect(() => {
    if (isPlaying && hasActiveTracks) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.05; // Update every 50ms for smoother milliseconds
        });
        // Left reel: 0.3 degrees per 50ms = 6 degrees per second = 60 seconds per full rotation
        setLeftReelRotation((prev) => prev + 0.3);
        // Right reel: 1.8 degrees per 50ms = 36 degrees per second = 10 seconds per full rotation
        setRightReelRotation((prev) => prev + 1.8);
      }, 50); // Update every 50ms for smoother milliseconds display

      // Start frequency analysis when playing
      startFrequencyAnalysis();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Stop frequency analysis when not playing
      stopFrequencyAnalysis();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopFrequencyAnalysis();
    };
  }, [isPlaying, totalDuration, hasActiveTracks]);

  // Reset current track if it's out of bounds when tracks change
  useEffect(() => {
    if (currentTrack >= activeTracks.length && activeTracks.length > 0) {
      console.log(`Track ${currentTrack + 1} out of bounds, resetting to track 1`);
      setCurrentTrack(0);
      setCurrentTime(0);
      setLeftReelRotation(0);
      setRightReelRotation(0);
      setIsPlaying(false);
      
      // Clean up audio when resetting
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [activeTracks.length, currentTrack]);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const startAudio = () => {
    if (!currentTrackData?.audioUrl) {
      console.log("❌ Cannot start audio: no track data or audio URL");
      return;
    }

    console.log(`🎵 Starting audio for: ${currentTrackData.name}`);
    console.log(`   Track ID: ${currentTrackData.id}`);
    console.log(`   Audio URL: ${currentTrackData.audioUrl.substring(0, 50)}...`);

    try {
      // Always create a new audio element to ensure we're playing the correct track
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Clean up previous audio context
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Create new audio element with current track
      audioRef.current = new Audio(currentTrackData.audioUrl);
      audioRef.current.loop = true; // Loop the audio
      audioRef.current.crossOrigin = "anonymous"; // For CORS
      audioRef.current.volume = volume / 100;
      audioRef.current.currentTime = currentTime;

      // Setup audio analysis after creating audio element
      setupAudioAnalysis();

      // Resume audio context if suspended (required by browser policies)
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }

      audioRef.current.play();
      console.log("✅ Audio started successfully");
    } catch (e) {
      console.log("❌ Error playing audio:", e);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handlePlayPause = async () => {
    if (!hasActiveTracks) return; // No tracks available to play

    if (!isPlaying) {
      console.log(
        `Starting playback for track: ${currentTrackData.name}`,
      );
      startAudio();
      setIsPlaying(true);
    } else {
      console.log("Stopping playback");
      stopAudio();
      setIsPlaying(false);
    }
  };

  const handleTimelineClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!hasActiveTracks) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * totalDuration;

    setCurrentTime(newTime);

    // Update audio current time
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }

    // Calculate disc rotations based on the new time position
    // Left reel: 6 degrees per second
    const leftRotation = newTime * 6;
    // Right reel: 36 degrees per second
    const rightRotation = newTime * 36;

    setLeftReelRotation(leftRotation);
    setRightReelRotation(rightRotation);
  };

  const handlePrevious = () => {
    if (!hasActiveTracks) return;

    console.log(`=== PREVIOUS BUTTON PRESSED ===`);
    console.log(`Current track: ${currentTrack + 1}/${activeTracks.length}`);
    console.log(`Track name: ${activeTracks[currentTrack]?.name}`);

    const wasPlaying = isPlaying;
    stopAudio();

    // Clean up audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    const prevTrackIndex = Math.max(0, currentTrack - 1);
    console.log(`Moving to track ${prevTrackIndex + 1}: ${activeTracks[prevTrackIndex]?.name}`);

    setCurrentTrack(prevTrackIndex);
    setCurrentTime(0);
    setLeftReelRotation(0);
    setRightReelRotation(0);

    // If was playing, start new track after state updates
    if (wasPlaying) {
      setTimeout(() => {
        console.log(`Starting previous track: ${activeTracks[prevTrackIndex]?.name}`);
        startAudio();
      }, 100);
    }
    
    console.log(`=== END PREVIOUS BUTTON ===`);
  };

  const handleNext = () => {
    if (!hasActiveTracks) return;

    console.log(`=== NEXT BUTTON PRESSED ===`);
    console.log(`Current track: ${currentTrack + 1}/${activeTracks.length}`);
    console.log(`Track name: ${activeTracks[currentTrack]?.name}`);
    console.log(`Is playing: ${isPlaying}`);

    const wasPlaying = isPlaying;
    stopAudio();

    // Clean up audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Check if we're on the last track of the playlist (regardless of playlist size)
    const isLastTrack = currentTrack === activeTracks.length - 1;
    
    if (isLastTrack) {
      // Special behavior for last track: jump back to track 1 and pause
      console.log(`Last track reached (${currentTrack + 1}/${activeTracks.length}), jumping back to track 1: ${activeTracks[0].name}`);
      setCurrentTrack(0); // Go back to first track
      setCurrentTime(0);
      setLeftReelRotation(0);
      setRightReelRotation(0);
      setIsPlaying(false); // Always pause when jumping back to first track
    } else {
      // Not last track: advance to next track
      const nextTrackIndex = currentTrack + 1;
      console.log(`Moving to track ${nextTrackIndex + 1}: ${activeTracks[nextTrackIndex]?.name}`);
      
      setCurrentTrack(nextTrackIndex);
      setCurrentTime(0);
      setLeftReelRotation(0);
      setRightReelRotation(0);

      // If was playing, start new track after state updates
      if (wasPlaying) {
        setTimeout(() => {
          console.log(`Starting new track: ${activeTracks[nextTrackIndex]?.name}`);
          startAudio();
        }, 100);
      }
    }
    
    console.log(`=== END NEXT BUTTON ===`);
  };

  const handleCustomTracksChange = (
    tracks: UploadedTrack[],
  ) => {
    console.log('=== RECEIVING TRACKS FROM UPLOADER ===');
    console.log('Received tracks:', tracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    
    // Stop current playback when tracks change
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    }

    // Create a clean copy to ensure no reference issues
    const cleanTracks = tracks.map((track, index) => ({
      id: track.id,
      name: track.name,
      duration: track.duration,
      color: track.color,
      audioUrl: track.audioUrl,
      file: track.file
    }));
    
    console.log('Setting custom tracks:', cleanTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    
    setCustomTracks(cleanTracks);
    setCurrentTrack(0);
    setCurrentTime(0);
    setLeftReelRotation(0);
    setRightReelRotation(0);

    // Clean up audio analysis
    if (audioRef.current) {
      audioRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopFrequencyAnalysis();

      if (audioRef.current) {
        audioRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Cleanup any object URLs for custom tracks
      customTracks.forEach((track) => {
        URL.revokeObjectURL(track.audioUrl);
      });
    };
  }, []);

  // Stop audio when track ends
  useEffect(() => {
    if (
      currentTime >= totalDuration &&
      isPlaying &&
      hasActiveTracks
    ) {
      stopAudio();
    }
  }, [currentTime, totalDuration, isPlaying, hasActiveTracks]);

  const formatTime = (seconds: number) => {
    const totalSecs = Math.floor(seconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (totalDuration === 0 || !hasActiveTracks) return 0;
    return Math.min(100, (currentTime / totalDuration) * 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-black rounded-[30px] p-12 relative">
      {/* Minimal Upload Button - positioned at timer center height */}
      <div className="absolute top-16 left-12 flex items-center justify-center z-50">
        <Dialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
        >
          <DialogTrigger asChild>
            <button
              className={`w-10 h-10 rounded-full bg-[#222] hover:bg-[#333] transition-colors flex items-center justify-center group relative ${!hasActiveTracks ? "upload-button-blink" : ""}`}
            >
              <div
                className={`w-5 h-5 text-[#ef3e22] group-hover:text-[#ef3e22] ${!hasActiveTracks ? "upload-icon" : ""}`}
              >
                <BackfaceIcon11 />
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a1a] border-[#333] max-w-2xl [&>button]:text-white">
            <DialogHeader>
              <DialogTitle className="text-[#CDD0C3]">
                Audio Library
              </DialogTitle>
              <DialogDescription className="text-[#545F69]">
                Upload up to 3 audio files in MP3, AAC, or WAV
                format. Each file must be 5 MB or smaller.
              </DialogDescription>
            </DialogHeader>
            <TrackUploader
              onTracksChange={handleCustomTracksChange}
              maxTracks={3}
              currentTracks={customTracks}
              onClose={() => setIsUploadDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Time Display at Top */}
      <div className="text-center mb-12">
        <div
          className={`text-6xl font-mono text-[#CDD0C3] tracking-wider transition-opacity duration-300 ${hasActiveTracks ? "opacity-100" : "opacity-30"}`}
        >
          {hasActiveTracks
            ? formatTime(currentTime)
            : "00:00"}
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex items-center justify-between mb-16 px-8">
        {/* Left Side - Waveform with Real-time Audio Analysis */}
        <div className="w-20 flex justify-start">
          <svg
            width="60"
            height="120"
            viewBox="0 0 60 120"
            className={`transition-opacity duration-300 ${hasActiveTracks ? "opacity-60" : "opacity-20"}`}
          >
            {Array.from({ length: 8 }, (_, i) => {
              // Enhanced animation with 10% speed increase and real-time audio analysis
              const baseSpeedMultiplier = 1.1; // 10% speed increase
              const timeBasedAnimation1 =
                Math.sin(i * 0.8 + currentTime * 0.13915) * 12; // 0.1265 * 1.1
              const timeBasedAnimation2 =
                Math.cos(i * 0.6 + currentTime * 0.11132) * 8; // 0.1012 * 1.1

              // Real-time frequency analysis influence
              const frequencyInfluence =
                isPlaying && analyserRef.current
                  ? (frequencyData[i] / 255) * 15
                  : 0;

              // Combine time-based animation with frequency analysis
              const waveform1 =
                45 +
                (hasActiveTracks
                  ? timeBasedAnimation1 + frequencyInfluence
                  : 0);
              const waveform2 =
                75 +
                (hasActiveTracks
                  ? timeBasedAnimation2 +
                    frequencyInfluence * 0.6
                  : 0);

              return (
                <g key={i}>
                  <path
                    d={`M${i * 7} 60 Q ${i * 7 + 3.5} ${waveform1}, ${i * 7 + 7} 60`}
                    stroke="#CDD0C3"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d={`M${i * 7} 60 Q ${i * 7 + 3.5} ${waveform2}, ${i * 7 + 7} 60`}
                    stroke="#CDD0C3"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Left Tape Reel */}
        <div className="flex flex-col items-center">
          <div
            className={`w-48 h-48 transition-all duration-75 ease-linear mb-6 ${!hasActiveTracks ? "opacity-50" : ""}`}
            style={{
              transform: `rotate(${leftReelRotation}deg)`,
            }}
          >
            <LeftReel />
          </div>

          {/* Previous Control - Below Left Disk */}
          <div
            className={`cursor-pointer transition-opacity ${hasActiveTracks ? "hover:opacity-80" : "opacity-30 cursor-not-allowed"}`}
            onClick={
              hasActiveTracks ? handlePrevious : undefined
            }
          >
            <svg width="53" height="40" viewBox="0 0 40 30">
              <path d="M6 15L16 8v14L6 15z" fill="#CDD0C3" />
              <path d="M16 15L26 8v14L16 15z" fill="#CDD0C3" />
            </svg>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center space-y-6">
          {/* Play/Pause Button */}
          <div
            className={`cursor-pointer transition-opacity ${hasActiveTracks ? "hover:opacity-80" : "opacity-30 cursor-not-allowed"}`}
            onClick={
              hasActiveTracks ? handlePlayPause : undefined
            }
          >
            <svg width="66" height="66" viewBox="0 0 60 60">
              {isPlaying ? (
                // Pause Icon
                <g>
                  <rect
                    x="20"
                    y="15"
                    width="6"
                    height="30"
                    fill="#CDD0C3"
                    rx="1"
                  />
                  <rect
                    x="34"
                    y="15"
                    width="6"
                    height="30"
                    fill="#CDD0C3"
                    rx="1"
                  />
                </g>
              ) : (
                // Play Icon
                <path
                  d="M22 15L22 45L42 30L22 15z"
                  fill="#CDD0C3"
                />
              )}
            </svg>
          </div>

          {/* Vector241 - Below Play Button */}
          <div className="scale-[0.8] origin-center">
            <div className="relative w-[87px] h-[44px]">
              <Vector241 />
            </div>
          </div>
        </div>

        {/* Right Tape Reel */}
        <div className="flex flex-col items-center">
          <div
            className={`w-48 h-48 transition-all duration-75 ease-linear mb-6 ${!hasActiveTracks ? "opacity-50" : ""}`}
            style={{
              transform: `rotate(${rightReelRotation}deg)`,
            }}
          >
            <RightReel />
          </div>

          {/* Next Control - Below Right Disk */}
          <div
            className={`cursor-pointer transition-opacity ${hasActiveTracks ? "hover:opacity-80" : "opacity-30 cursor-not-allowed"}`}
            onClick={hasActiveTracks ? handleNext : undefined}
          >
            <svg width="53" height="40" viewBox="0 0 40 30">
              <path d="M34 15L24 22V8l10 7z" fill="#CDD0C3" />
              <path d="M24 15L14 22V8l10 7z" fill="#CDD0C3" />
            </svg>
          </div>
        </div>

        {/* Right Side - Volume Display with Frame116 design */}
        <div
          className={`w-20 flex justify-center transition-opacity duration-300 ${hasActiveTracks ? "opacity-100" : "opacity-30"}`}
        >
          <div className="h-80 w-8 flex flex-col items-center">
            <div className="w-8 h-64">
              <InteractiveVolumeDisplay
                volume={volume}
                onVolumeChange={setVolume}
              />
            </div>

            {/* Volume percentage */}
            <div
              className="text-[#545F69] text-sm mt-4 font-mono"
              style={{ transform: "scale(1.3)" }}
            >
              {volume}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative px-8">
        {/* Timeline Markers */}
        <div className="flex justify-between mb-4 px-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`h-[22px] bg-[#555F69] transition-opacity ${!hasActiveTracks ? "opacity-30" : ""}`}
              style={{ width: "2px" }}
            />
          ))}
        </div>

        {/* Timeline Bar */}
        <div
          className={`relative h-3.5 bg-[#29221D] rounded-[50px] overflow-hidden transition-opacity ${hasActiveTracks ? "cursor-pointer" : "opacity-30 cursor-not-allowed"}`}
          onClick={
            hasActiveTracks ? handleTimelineClick : undefined
          }
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#3D6087] transition-all duration-100"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mt-8">
        {isLoadingDefault ? (
          <div className="text-[#545F69] text-[13px]">
            Loading default track...
          </div>
        ) : hasActiveTracks ? (
          <div className="text-[#CDD0C3] text-[13px]">
            Track {currentTrack + 1} of {activeTracks.length}:{" "}
            {activeTracks[currentTrack]?.name}
          </div>
        ) : (
          <div className="text-[#545F69] text-[13px]">
            {defaultTrackError
              ? `Upload an audio file to start listening.`
              : "No audio file available. Upload a one."}
          </div>
        )}
      </div>
    </div>
  );
}