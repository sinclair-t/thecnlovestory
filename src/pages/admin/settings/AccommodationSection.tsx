import { useEffect, useState } from 'react';
import { Hotel, Check, ExternalLink } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const KEYS = ['accommodation_enabled', 'accommodation_hotel_name', 'accommodation_hotel_url', 'accommodation_notice_text'];

interface AccomState {
  enabled: boolean;
  hotelName: string;
  hotelUrl: string;
  noticeText: string;
}

export default function AccommodationSection() {
  const [state, setState] = useState<AccomState>({
    enabled: false,
    hotelName: 'Envoy Hotel',
    hotelUrl: '',
    noticeText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', KEYS).then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach(r => { map[r.key] = r.value ?? ''; });
      setState({
        enabled: map['accommodation_enabled'] === 'true',
        hotelName: map['accommodation_hotel_name'] || 'Envoy Hotel',
        hotelUrl: map['accommodation_hotel_url'] || '',
        noticeText: map['accommodation_notice_text'] || '',
      });
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await Promise.all([
      supabase.from('settings').update({ value: String(state.enabled), updated_at: new Date().toISOString() }).eq('key', 'accommodation_enabled'),
      supabase.from('settings').update({ value: state.hotelName, updated_at: new Date().toISOString() }).eq('key', 'accommodation_hotel_name'),
      supabase.from('settings').update({ value: state.hotelUrl, updated_at: new Date().toISOString() }).eq('key', 'accommodation_hotel_url'),
      supabase.from('settings').update({ value: state.noticeText, updated_at: new Date().toISOString() }).eq('key', 'accommodation_notice_text'),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="p-6 text-center text-gray-400 text-sm font-sans">Loading...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center">
            <Hotel size={16} className="text-teal-600" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-gray-700 text-sm uppercase tracking-wide">Guest Accommodation</h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Show a dismissable hotel notice to visitors</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 font-sans flex items-center gap-1"><Check size={12} /> Saved</span>}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-sans text-gray-500">{state.enabled ? 'Visible' : 'Hidden'}</span>
            <div
              onClick={() => setState(s => ({ ...s, enabled: !s.enabled }))}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${state.enabled ? 'bg-teal-500' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${state.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 font-sans mb-1">Hotel Name</label>
            <input
              type="text"
              value={state.hotelName}
              onChange={e => setState(s => ({ ...s, hotelName: e.target.value }))}
              placeholder="e.g. Envoy Hotel"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-sans mb-1">Hotel Booking URL</label>
            <input
              type="url"
              value={state.hotelUrl}
              onChange={e => setState(s => ({ ...s, hotelUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 font-sans mb-1">Notice Text</label>
          <p className="text-xs text-gray-400 font-sans mb-2">
            Write the notice text. Wherever the hotel name appears, it will be rendered as a clickable link.
          </p>
          <textarea
            value={state.noticeText}
            onChange={e => setState(s => ({ ...s, noticeText: e.target.value }))}
            rows={3}
            placeholder={`e.g. We have arranged special accommodation for our out-of-town guests at ${state.hotelName || 'Envoy Hotel'}. Click the hotel name to book.`}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
        </div>

        {state.hotelUrl && state.noticeText && (
          <div className="bg-dark-950/90 border border-amber-500/30 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-400 font-sans uppercase tracking-widest mb-1">Preview</p>
            <p className="text-sm text-white/90 font-sans leading-relaxed">
              {state.noticeText.split(state.hotelName).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <a
                      href={state.hotelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-300 font-semibold underline underline-offset-2"
                    >
                      {state.hotelName}<ExternalLink size={11} />
                    </a>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
          </div>
        )}

        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-sm font-sans rounded-lg hover:bg-gray-800 transition-colors">
          <Check size={14} /> {saving ? 'Saving...' : 'Save Accommodation Settings'}
        </button>
      </form>
    </div>
  );
}
