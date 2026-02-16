import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Upload, AlertCircle } from 'lucide-react';
import BackfaceIcon11 from '../imports/BackfaceIcon11-2016-861';

interface UploadedTrack {
  id: number;
  name: string;
  duration: number;
  color: string;
  audioUrl: string;
  file: File;
}

interface TrackUploaderProps {
  onTracksChange: (tracks: UploadedTrack[]) => void;
  maxTracks?: number;
  currentTracks?: UploadedTrack[];
  onClose?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FORMATS = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4'];
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.aac'];

export function TrackUploader({ onTracksChange, maxTracks = 3, currentTracks = [], onClose }: TrackUploaderProps) {
  const [stagedTracks, setStagedTracks] = useState<UploadedTrack[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [trackIdCounter, setTrackIdCounter] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize staged tracks with current tracks when modal opens
  useEffect(() => {
    console.log('Initializing staged tracks with:', currentTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    setStagedTracks([...currentTracks]); // Create a new array to avoid reference issues
    
    // Set counter to be higher than any existing track ID
    const maxId = currentTracks.length > 0 ? Math.max(...currentTracks.map(t => t.id)) : 0;
    setTrackIdCounter(maxId + 1);
  }, [currentTracks]);

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration || 180); // Default to 3 minutes if unable to detect
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(180); // Default to 3 minutes on error
      });
      
      audio.src = url;
    });
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    // Check file format by MIME type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      // Fallback: check by file extension if MIME type is not recognized
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return `${file.name}: Only MP3, AAC, and WAV files are supported`;
      }
    }

    return null; // File is valid
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || stagedTracks.length >= maxTracks) return;

    setIsUploading(true);
    setUploadErrors([]);
    
    const errors: string[] = [];
    const newTracks: UploadedTrack[] = [];
    
    // Calculate how many files we can actually process
    const availableSlots = maxTracks - stagedTracks.length;
    const filesToProcess = Math.min(files.length, availableSlots);
    
    console.log(`Processing ${filesToProcess} files, ${availableSlots} slots available`);
    console.log(`Current staged tracks before upload:`, stagedTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    
    // Process files one by one to maintain order
    let currentTrackId = trackIdCounter;
    
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      console.log(`Processing file ${i + 1}/${filesToProcess}: ${file.name}`);
      
      // Validate file first
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        console.log(`Validation failed for ${file.name}: ${validationError}`);
        continue;
      }
      
      // Check for duplicate names
      const fileName = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
      const isDuplicate = stagedTracks.some(track => track.name.toLowerCase() === fileName) ||
                         newTracks.some(track => track.name.toLowerCase() === fileName);
      
      if (isDuplicate) {
        errors.push(`${file.name}: Track with this name already exists`);
        console.log(`Duplicate name detected for ${file.name}`);
        continue;
      }
      
      try {
        const duration = await getAudioDuration(file);
        const audioUrl = URL.createObjectURL(file);
        
        const track: UploadedTrack = {
          id: currentTrackId,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          duration: duration,
          color: "#3D6087",
          audioUrl: audioUrl,
          file: file
        };
        
        newTracks.push(track);
        currentTrackId++;
        
        console.log(`Successfully processed: ${track.name} (ID: ${track.id})`);
      } catch (error) {
        errors.push(`${file.name}: Error processing audio file`);
        console.error(`Error processing ${file.name}:`, error);
      }
    }
    
    // Update the track ID counter for next uploads
    setTrackIdCounter(currentTrackId);
    
    // Combine existing staged tracks with new tracks (maintaining order)
    const updatedTracks = [...stagedTracks, ...newTracks];
    
    console.log(`New tracks added:`, newTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    console.log(`Updated staged tracks:`, updatedTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    
    setStagedTracks(updatedTracks);
    setUploadErrors(errors);
    setIsUploading(false);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeTrack = (trackId: number) => {
    console.log(`Removing track with ID: ${trackId}`);
    
    const trackToRemove = stagedTracks.find(t => t.id === trackId);
    if (trackToRemove) {
      console.log(`Removing track: ${trackToRemove.name}`);
      URL.revokeObjectURL(trackToRemove.audioUrl);
    }
    
    const updatedTracks = stagedTracks.filter(track => track.id !== trackId);
    console.log(`Tracks after removal:`, updatedTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    
    setStagedTracks(updatedTracks);
  };

  const updateTrackName = (trackId: number, newName: string) => {
    const updatedTracks = stagedTracks.map(track => 
      track.id === trackId ? { ...track, name: newName } : track
    );
    setStagedTracks(updatedTracks);
  };

  const handleDone = () => {
    console.log(`Committing staged tracks to parent:`, stagedTracks.map((t, i) => `${i + 1}: ${t.name} (ID: ${t.id})`));
    
    // Create a clean copy of the tracks to ensure no reference issues
    const tracksToCommit = stagedTracks.map(track => ({
      id: track.id,
      name: track.name,
      duration: track.duration,
      color: track.color,
      audioUrl: track.audioUrl,
      file: track.file
    }));
    
    // Only now do we commit the staged tracks to the parent
    onTracksChange(tracksToCommit);
    if (onClose) {
      onClose();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={stagedTracks.length >= maxTracks || isUploading}
          className="bg-[#545F69] hover:bg-[#6B7280] text-white disabled:bg-[#3a3a3a] disabled:text-[#666] disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Processing...' : stagedTracks.length >= maxTracks ? 'Max Tracks' : 'Upload'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.aac,audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/aac,audio/mp4"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Error Messages */}
      {uploadErrors.length > 0 && (
        <div className="space-y-2">
          {uploadErrors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-red-950/20 border border-red-800/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ))}
        </div>
      )}

      {stagedTracks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-[#545F69] rounded-lg">
          <div className="w-12 h-12 mx-auto mb-4 text-[#545F69]">
            <BackfaceIcon11 />
          </div>
          <p className="text-[#545F69]">No audio file uploaded</p>
        
        </div>
      ) : (
        <div className="space-y-3">
          {stagedTracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#545F69]"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-[#3D6087] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{index + 1}</span>
              </div>
              
              <div className="flex-1">
                <Input
                  value={track.name}
                  onChange={(e) => updateTrackName(track.id, e.target.value)}
                  className="bg-transparent border-none text-[#CDD0C3] p-0 h-auto focus:ring-0"
                  placeholder="Track name"
                />
                <p className="text-xs text-[#545F69] mt-1">
                  Duration: {formatDuration(track.duration)} • Size: {formatFileSize(track.file.size)}
                </p>
              </div>
              
              <Button
                onClick={() => removeTrack(track.id)}
                variant="ghost"
                size="sm"
                className="text-[#545F69] hover:text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {stagedTracks.length > 0 && stagedTracks.length < maxTracks && (
        <p className="text-xs text-[#545F69] text-center">
          You can upload {maxTracks - stagedTracks.length} more track{maxTracks - stagedTracks.length !== 1 ? 's' : ''}
        </p>
      )}

      {stagedTracks.length >= maxTracks && (
        <p className="text-xs text-[#545F69] text-center">
          Maximum tracks reached (3/3)
        </p>
      )}

      {/* Done Button */}
      {onClose && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleDone}
            disabled={isUploading}
            className="bg-[#ef3e22] hover:bg-[#d63518] text-white px-6 disabled:bg-[#666] disabled:text-[#999] disabled:cursor-not-allowed"
          >
            {isUploading ? 'Processing...' : 'Done'}
          </Button>
        </div>
      )}
    </div>
  );
}