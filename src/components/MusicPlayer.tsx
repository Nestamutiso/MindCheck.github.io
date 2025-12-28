import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";

interface Track {
  id: string;
  name: string;
  url: string;
  description: string;
}

// Free ambient music tracks for mental wellness
const tracks: Track[] = [
  {
    id: "1",
    name: "Gentle Rain",
    url: "https://www.soundjay.com/nature/sounds/rain-03.mp3",
    description: "Soothing rain sounds",
  },
  {
    id: "2", 
    name: "Ocean Waves",
    url: "https://www.soundjay.com/nature/sounds/ocean-wave-2.mp3",
    description: "Calming ocean ambience",
  },
  {
    id: "3",
    name: "Forest Birds",
    url: "https://www.soundjay.com/nature/sounds/birds-1.mp3", 
    description: "Peaceful forest sounds",
  },
];

const MusicPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
    }
  };

  const handleEnded = () => {
    // Loop the track
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
        loop
      />
      
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-24 right-4 z-40"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-3 bg-card rounded-2xl p-4 shadow-soft border border-border w-64"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Calm Sounds
              </h4>
              
              <div className="space-y-2 mb-4">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      currentTrack.id === track.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{track.name}</p>
                    <p className="text-xs text-muted-foreground">{track.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-foreground" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 rounded-full gradient-primary shadow-glow flex items-center justify-center relative"
        >
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full gradient-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ opacity: 0.3 }}
            />
          )}
          <Music className="w-6 h-6 text-primary-foreground" />
          
          <div className="absolute -top-1 -right-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-primary-foreground bg-primary rounded-full" />
            ) : (
              <ChevronUp className="w-4 h-4 text-primary-foreground bg-primary rounded-full" />
            )}
          </div>
        </motion.button>

        {isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-soft border border-border flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-foreground" />
            ) : (
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            )}
          </motion.button>
        )}
      </motion.div>
    </>
  );
};

export default MusicPlayer;
