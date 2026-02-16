# OP-1 Inspired Music Player

A React-based music player inspired by the Teenage Engineering OP-1 synthesizer interface.

## Features

- OP-1 inspired tape reel design with synchronized rotation
- Real-time waveform visualization
- Custom audio track upload (MP3, WAV, AAC)
- Volume control with visual feedback
- Timeline scrubbing
- Optional default track system

## Setup Instructions

### Adding Your Default Track (Optional)

The music player can work with or without a default track. To add one:

1. **Create the audio folder:**
   ```
   mkdir public/audio
   ```

2. **Add your audio file:**
   - Place your MP3, WAV, or AAC file in `public/audio/`
   - Rename it to exactly: `default-track.mp3` (or use .wav/.aac extension)
   - **Important:** Must be a valid audio file, not a placeholder

3. **File requirements:**
   - **Supported formats:** MP3, WAV, AAC
   - **Maximum size:** 5MB recommended
   - **Quality:** Any bitrate/sample rate supported by browsers

4. **Update track name (optional):**
   - Edit `components/MusicPlayer.tsx`
   - Find the `staticDefaultTrack` constant (around line 25)
   - Change the `name` field to your desired track name

### Without Default Track

If you don't add a default track file:
- The player will show "Upload a track to get started"
- All functionality works normally once users upload tracks
- No errors or issues

## How It Works

1. **Default Track:** Loads automatically from `/public/audio/default-track.mp3` if present
2. **Custom Uploads:** Users can upload up to 3 tracks temporarily (session-only)
3. **Graceful Fallback:** Works perfectly without any default track

## Project Structure

```
/public/audio/default-track.mp3    # Your default audio file (optional)
/components/MusicPlayer.tsx        # Main player component
/components/TrackUploader.tsx      # Upload interface
```

## Development

The player uses React hooks for state management and the Web Audio API for audio playback. The tape reel animations are pure CSS transforms synced with the audio timeline.

## Troubleshooting

### "Default track unavailable" message
- Check that `public/audio/default-track.mp3` exists and is a valid audio file
- Verify the file isn't corrupted by playing it in another audio player
- Ensure the file extension matches the actual format (.mp3 for MP3 files)
- Check browser console for specific error details

### Player shows empty state
- This is normal if no default track is configured
- Users can upload tracks using the upload button (top-left)
- The interface will activate once tracks are available

## Notes

- Default track is served statically and available to all users
- Custom uploaded tracks are temporary and lost on page refresh
- Player requires user interaction to start audio (browser policy)
- All file validation happens client-side for privacy