import { useEffect, useRef, useState } from 'react';
import { Music, Upload, Play, Pause, Trash2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface MusicState {
  enabled: boolean;
  fileUrl: string;
  filePath: string;
  fileName: string;
  volume: number;
}

const KEYS = ['music_enabled', 'music_file_url', 'music_file_path', 'music_file_name', 'music_volume'];

export default function MusicSection() {
  const [state, setState] = useState<MusicState>({ enabled: false, fileUrl: '', filePath: '', fileName: '', volume: 0.4 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', KEYS).then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach(r => { map[r.key] = r.value ?? ''; });
      setState({
        enabled: map['music_enabled'] === 'true',
        fileUrl: map['music_file_url'] ?? '',
        filePath: map['music_file_path'] ?? '',
        fileName: map['music_file_name'] ?? '',
        volume: parseFloat(map['music_volume'] ?? '0.4') || 0.4,
      });
      setLoading(false);
    });
  }, []);

  const saveSetting = async (key: string, value: string) => {
    await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
  };

  const handleToggle = async (enabled: boolean) => {
    setState(s => ({ ...s, enabled }));
    await saveSetting('music_enabled', String(enabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleVolumeChange = async (volume: number) => {
    setState(s => ({ ...s, volume }));
    if (audioRef.current) audioRef.current.volume = volume;
  };

  const handleSaveVolume = async () => {
    await saveSetting('music_volume', String(state.volume));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      setError('Please upload an MP3 or audio file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      if (state.filePath) {
        await supabase.storage.from('music').remove([state.filePath]);
      }

      const ext = file.name.split('.').pop();
      const path = `background/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('music').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('music').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      await Promise.all([
        saveSetting('music_file_path', path),
        saveSetting('music_file_url', publicUrl),
        saveSetting('music_file_name', file.name),
      ]);

      setState(s => ({ ...s, filePath: path, fileUrl: publicUrl, fileName: file.name }));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Make sure the "music" storage bucket exists.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove the current music file?')) return;
    setSaving(true);
    if (state.filePath) {
      await supabase.storage.from('music').remove([state.filePath]);
    }
    await Promise.all([
      saveSetting('music_file_path', ''),
      saveSetting('music_file_url', ''),
      saveSetting('music_file_name', ''),
      saveSetting('music_enabled', 'false'),
    ]);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    setState(s => ({ ...s, filePath: '', fileUrl: '', fileName: '', enabled: false }));
    setSaving(false);
  };

  const togglePreview = () => {
    if (!state.fileUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(state.fileUrl);
      audio.volume = state.volume;
      audio.loop = true;
      audioRef.current = audio;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400 text-sm font-sans">Loading...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center">
            <Music size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-gray-700 text-sm uppercase tracking-wide">Background Music</h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Auto-plays on first user interaction (scroll/click)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><Check size={12} /> Saved</span>}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-sans text-gray-500">{state.enabled ? 'Enabled' : 'Disabled'}</span>
            <div
              onClick={() => handleToggle(!state.enabled)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${state.enabled ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${state.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-sans text-red-700">{error}</p>
        </div>
      )}

      {state.fileUrl ? (
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={togglePreview}
                className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white hover:bg-amber-600 transition-colors flex-shrink-0"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-sans font-medium text-gray-900 truncate">{state.fileName || 'Background Music'}</p>
                <p className="text-xs text-gray-400 font-sans">{isPlaying ? 'Playing preview...' : 'Click play to preview'}</p>
              </div>
            </div>
            <button onClick={handleRemove} disabled={saving} className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all mb-4"
        >
          <Upload size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="font-sans text-sm text-gray-500 mb-1">{uploading ? 'Uploading...' : 'Click to upload MP3'}</p>
          <p className="font-sans text-xs text-gray-400">MP3 format · Max 20MB</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="audio/*,.mp3" className="hidden" onChange={handleUpload} />

      {state.fileUrl && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs font-sans text-gray-500 hover:text-gray-700 underline mb-4 block"
        >
          {uploading ? 'Uploading...' : 'Replace with different file'}
        </button>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-sans text-gray-500">Default Volume: {Math.round(state.volume * 100)}%</label>
          <button onClick={handleSaveVolume} className="text-xs font-sans text-amber-600 hover:text-amber-700">Save volume</button>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={state.volume}
          onChange={e => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );
}
