import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type PlayState = 'idle' | 'playing' | 'paused' | 'blocked';

interface MusicSettings {
  fileUrl: string;
  volume: number;
}

function WaveformBars({ active }: { active: boolean }) {
  return (
    <span className="flex items-end gap-px h-4" aria-hidden="true">
      {[1, 2, 3, 2, 1].map((h, i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-gold-400 transition-all"
          style={{
            height: active ? `${h * 4}px` : '2px',
            animation: active ? `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </span>
  );
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [settings, setSettings] = useState<MusicSettings | null>(null);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const interactionBound = useRef(false);
  const hasAttemptedAutoplay = useRef(false);

  useEffect(() => {
    supabase
      .from('settings')
      .select('key, value')
      .in('key', ['music_enabled', 'music_file_url', 'music_volume'])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.key] = r.value ?? ''; });
        if (map['music_enabled'] !== 'true' || !map['music_file_url']) return;
        setSettings({
          fileUrl: map['music_file_url'],
          volume: parseFloat(map['music_volume'] ?? '0.4') || 0.4,
        });
      });
  }, []);

  useEffect(() => {
    if (!settings?.fileUrl) return;

    const audio = new Audio(settings.fileUrl);
    audio.loop = true;
    audio.volume = settings.volume;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('play', () => setPlayState('playing'));
    audio.addEventListener('pause', () => setPlayState(s => s === 'blocked' ? 'blocked' : 'paused'));
    audio.addEventListener('ended', () => setPlayState('paused'));

    const attemptAutoplay = async () => {
      if (hasAttemptedAutoplay.current) return;
      hasAttemptedAutoplay.current = true;
      try {
        await audio.play();
        setPlayState('playing');
      } catch {
        setPlayState('blocked');
        bindInteractionAutoplay(audio);
      }
    };

    audio.addEventListener('canplay', attemptAutoplay, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      hasAttemptedAutoplay.current = false;
      interactionBound.current = false;
    };
  }, [settings]);

  const bindInteractionAutoplay = (audio: HTMLAudioElement) => {
    if (interactionBound.current) return;
    interactionBound.current = true;

    const resume = () => {
      audio.play().then(() => {
        setPlayState('playing');
      }).catch(() => {});
    };

    const events: (keyof WindowEventMap)[] = ['scroll', 'click', 'keydown', 'touchstart', 'pointerdown'];
    const handler = () => {
      resume();
      events.forEach(ev => window.removeEventListener(ev, handler));
    };
    events.forEach(ev => window.addEventListener(ev, handler, { once: false, passive: true }));
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playState === 'playing') {
      audio.pause();
      setPlayState('paused');
    } else {
      audio.play().then(() => setPlayState('playing')).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(m => !m);
  };

  if (!settings || dismissed) return null;

  const isPlaying = playState === 'playing';
  const isBlocked = playState === 'blocked';

  return (
    <>
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(201,148,26,0.35); }
          70%  { box-shadow: 0 0 0 8px rgba(201,148,26,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,148,26,0); }
        }
      `}</style>

      <div
        role="region"
        aria-label="Background music player"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-dark-950/90 backdrop-blur-sm border border-gold-500/30 rounded-full px-4 py-2.5 shadow-2xl transition-all duration-300"
        style={isBlocked ? { animation: 'pulse-ring 2s ease-in-out infinite' } : undefined}
      >
        <Music size={13} className="text-gold-400 flex-shrink-0" />

        <WaveformBars active={isPlaying} />

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          className="text-white hover:text-gold-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
          className="text-white hover:text-gold-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {isBlocked && (
          <span className="text-gold-300/90 text-xs font-sans ml-0.5 hidden sm:block whitespace-nowrap">
            Tap to play
          </span>
        )}

        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.pause();
            setDismissed(true);
          }}
          aria-label="Dismiss music player"
          className="text-dark-400 hover:text-white transition-colors ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full"
        >
          <X size={13} />
        </button>
      </div>
    </>
  );
}
