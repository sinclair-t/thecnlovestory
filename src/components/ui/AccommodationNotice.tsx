import { useEffect, useState } from 'react';
import { Hotel, ExternalLink, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AccommodationSettings {
  hotelName: string;
  hotelUrl: string;
  noticeText: string;
}

export default function AccommodationNotice() {
  const [settings, setSettings] = useState<AccommodationSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('accommodation_dismissed') === 'true';
    if (wasDismissed) { setDismissed(true); return; }

    supabase
      .from('settings')
      .select('key, value')
      .in('key', ['accommodation_enabled', 'accommodation_hotel_name', 'accommodation_hotel_url', 'accommodation_notice_text'])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.key] = r.value ?? ''; });
        if (map['accommodation_enabled'] !== 'true') return;
        if (!map['accommodation_hotel_url']) return;
        setSettings({
          hotelName: map['accommodation_hotel_name'] || 'Envoy Hotel',
          hotelUrl: map['accommodation_hotel_url'],
          noticeText: map['accommodation_notice_text'] || '',
        });
      });
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('accommodation_dismissed', 'true');
  };

  if (!settings || dismissed) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slide-down">
      <div className="bg-dark-950/95 backdrop-blur-sm border border-gold-500/40 rounded-lg px-5 py-4 shadow-2xl flex items-start gap-4">
        <div className="w-9 h-9 bg-gold-500/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Hotel size={16} className="text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs text-gold-400 uppercase tracking-widest mb-1">Accommodation</p>
          <p className="font-sans text-sm text-white/90 leading-relaxed">
            {settings.noticeText.split(settings.hotelName).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <a
                    href={settings.hotelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gold-300 hover:text-gold-200 font-semibold underline underline-offset-2 transition-colors"
                  >
                    {settings.hotelName}
                    <ExternalLink size={11} />
                  </a>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0 mt-0.5"
          aria-label="Dismiss notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
