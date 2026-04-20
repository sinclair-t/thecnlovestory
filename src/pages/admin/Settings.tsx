import { useEffect, useState } from 'react';
import { Save, Check, Settings2, CreditCard, Music, Hotel } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Setting } from '../../lib/types';
import BankAccountsSection from './settings/BankAccountsSection';
import MusicSection from './settings/MusicSection';
import AccommodationSection from './settings/AccommodationSection';

const KEY_GROUPS = [
  {
    label: 'Wedding Info',
    keys: ['wedding_couple_names', 'wedding_date', 'ceremony_time', 'reception_time', 'hashtag'],
  },
  {
    label: 'Venue',
    keys: ['venue_name', 'venue_address', 'venue_google_maps_url'],
  },
  {
    label: 'Deadlines',
    keys: ['asoebe_deadline', 'asoebe_deadline_iso', 'shipping_covered_amount'],
  },
  {
    label: 'Notices',
    keys: ['notice_no_physical_gifts', 'notice_asoebe_mandatory'],
  },
  {
    label: 'Contact',
    keys: ['contact_email', 'groom_name', 'bride_name'],
  },
  {
    label: 'Our Story',
    keys: ['story_heading', 'story_paragraph_1', 'story_paragraph_2'],
    textarea: ['story_paragraph_1', 'story_paragraph_2'],
  },
];

type Tab = 'general' | 'bank' | 'music' | 'accommodation';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <Settings2 size={15} /> },
  { id: 'bank', label: 'Bank Accounts', icon: <CreditCard size={15} /> },
  { id: 'music', label: 'Music', icon: <Music size={15} /> },
  { id: 'accommodation', label: 'Accommodation', icon: <Hotel size={15} /> },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    const map: Record<string, string> = {};
    (data ?? []).forEach((row: Setting) => { map[row.key] = row.value ?? ''; });
    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    const generalKeys = KEY_GROUPS.flatMap(g => g.keys);
    for (const key of generalKeys) {
      if (key in settings) {
        await supabase.from('settings').update({ value: settings[key], updated_at: new Date().toISOString() }).eq('key', key);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-sans text-sm">Loading settings...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 font-sans">Settings</h1>
        <p className="text-sm text-gray-500 font-sans">Wedding details and site configuration</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-sans font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 text-sm font-sans rounded-lg hover:bg-gray-800 transition-colors"
            >
              {saved ? <><Check size={15} className="text-green-400" /> Saved!</> : <><Save size={15} /> {saving ? 'Saving...' : 'Save All'}</>}
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {KEY_GROUPS.map(group => (
              <div key={group.label} className={`bg-white rounded-lg border border-gray-200 p-5 ${'textarea' in group ? 'lg:col-span-2' : ''}`}>
                <h3 className="font-sans font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">{group.label}</h3>
                <div className={`space-y-3 ${'textarea' in group ? 'grid md:grid-cols-3 gap-4 space-y-0' : ''}`}>
                  {group.keys.map(key => {
                    const isTextarea = 'textarea' in group && (group as { textarea: string[] }).textarea.includes(key);
                    return (
                      <div key={key}>
                        <label className="block text-xs text-gray-500 font-sans mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                        {isTextarea ? (
                          <textarea
                            value={settings[key] ?? ''}
                            onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={settings[key] ?? ''}
                            onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bank' && <BankAccountsSection />}
      {activeTab === 'music' && <MusicSection />}
      {activeTab === 'accommodation' && <AccommodationSection />}
    </div>
  );
}
